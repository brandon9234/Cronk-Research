import json
import hashlib
import sqlite3
import tempfile
import unittest
from pathlib import Path
from research_workspace_store import ingest


class SnapshotStoreTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root=Path(self.temp.name);self.db=self.root/'projection.sqlite'
        self.assets={
            'manifest':{'schemaVersion':1,'builtAt':'2026-09-09','sourceSnapshotAt':'2026-06-01'},
            'shops':{'schemaVersion':1,'shops':[{'id':'shop:one','name':'One','estimateKind':'missing','observedReviews':0,'estimatedDailySales':None,'sourceAsOf':None}]},
            'shop-details':{'schemaVersion':1,'shops':{'shop:one':{'monthly':[{'month':'2026-05','observedReviews':5,'estimatedSales':None}]}}},
            'moments':{'schemaVersion':1,'moments':[{'id':'winter','label':'Winter gifts','calendar':{'months':[12,1]}}]}}
        self.write()

    def write(self):
        for key,value in self.assets.items():
            if key!='manifest':(self.root/(key+'.json')).write_text(json.dumps(value))
        self.assets['manifest']['assets']={'shops':'shops.json','moments':'moments.json','shopDetails':'shop-details.json'}
        self.assets['manifest']['assetIntegrity']={k:{'bytes':(self.root/v).stat().st_size,'sha256':hashlib.sha256((self.root/v).read_bytes()).hexdigest()} for k,v in self.assets['manifest']['assets'].items()}
        (self.root/'manifest.json').write_text(json.dumps(self.assets['manifest']))

    def test_rerender_is_idempotent_and_null_is_not_zero(self):
        first=ingest(self.root,self.db)
        self.assets['manifest']['builtAt']='2026-09-10';self.write()
        second=ingest(self.root,self.db)
        self.assertEqual(first['snapshotId'],second['snapshotId']);self.assertEqual(second['status'],'existing')
        with sqlite3.connect(self.db) as c:
            self.assertEqual(c.execute('SELECT estimated_daily_sales,observed_reviews FROM shop_observation').fetchall(),[(None,0)])
            self.assertEqual(c.execute('SELECT count(*) FROM moment_planning_month').fetchone()[0],2)

    def test_new_evidence_preserves_prior_snapshot(self):
        ingest(self.root,self.db)
        self.assets['manifest']['sourceSnapshotAt']='2026-06-02';self.assets['shops']['shops'][0]['observedReviews']=7;self.write()
        ingest(self.root,self.db)
        with sqlite3.connect(self.db) as c:
            self.assertEqual(c.execute('SELECT count(*) FROM research_snapshot').fetchone()[0],2)
            self.assertEqual(c.execute('SELECT observed_reviews FROM latest_shop_observation').fetchone()[0],7)

    def test_invalid_foreign_key_rolls_back_entire_snapshot(self):
        ingest(self.root,self.db)
        self.assets['shop-details']['shops']['shop:missing']={'weekly':[{'weekStart':'2026-06-01','observedReviews':3}]};self.write()
        with self.assertRaises(sqlite3.IntegrityError):ingest(self.root,self.db)
        with sqlite3.connect(self.db) as c:self.assertEqual(c.execute('SELECT count(*) FROM research_snapshot').fetchone()[0],1)

    def test_duplicate_identity_is_rejected(self):
        self.assets['shops']['shops']*=2;self.write()
        with self.assertRaises(sqlite3.IntegrityError):ingest(self.root,self.db)
        with sqlite3.connect(self.db) as c:self.assertEqual(c.execute('SELECT count(*) FROM research_snapshot').fetchone()[0],0)

    def test_real_columnar_transport_preserves_dictionary_nulls(self):
        shops=self.assets['shops'];row=shops.pop('shops')[0]
        columns=list(row);values=list(row.values());values[columns.index('estimateKind')]=0
        shops.update(encoding='columnar-dictionary-json',columns=columns,rows=[values],dictionaries={'estimateKind':['missing']})
        self.write();ingest(self.root,self.db)
        with sqlite3.connect(self.db) as c:self.assertEqual(c.execute('SELECT estimate_kind,estimated_daily_sales FROM shop_observation').fetchone(),('missing',None))

    def test_manifest_integrity_rejects_mutation_before_database_creation(self):
        self.write()
        (self.root/'shops.json').write_text((self.root/'shops.json').read_text()+' ')
        with self.assertRaisesRegex(ValueError,'integrity'):ingest(self.root,self.db)
        self.assertFalse(self.db.exists())


if __name__=='__main__':unittest.main()
