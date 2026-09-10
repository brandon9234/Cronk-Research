#!/usr/bin/env python3
"""Append-only, local analytical snapshots of the public research read model.

The raw collectors remain the source of truth. This database is a rebuildable
projection with explicit snapshot, shop, review-period and planning-window grains.
No credentials, customer receipts, network calls or collector writes are involved.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from cronk_research.workspace import decode_shops

SCHEMA_VERSION = 1
DDL = """
CREATE TABLE IF NOT EXISTS research_snapshot (
 id TEXT PRIMARY KEY, source_snapshot_at TEXT, first_imported_at TEXT NOT NULL,
 manifest_json TEXT NOT NULL CHECK(json_valid(manifest_json))
);
CREATE TABLE IF NOT EXISTS shop (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, url TEXT
);
CREATE TABLE IF NOT EXISTS shop_observation (
 snapshot_id TEXT NOT NULL REFERENCES research_snapshot(id),
 shop_id TEXT NOT NULL REFERENCES shop(id),
 source_as_of TEXT, estimate_kind TEXT NOT NULL,
 estimated_daily_sales REAL CHECK(estimated_daily_sales IS NULL OR estimated_daily_sales>=0),
 observed_reviews INTEGER CHECK(observed_reviews IS NULL OR observed_reviews>=0),
 data_json TEXT NOT NULL CHECK(json_valid(data_json)),
 PRIMARY KEY(snapshot_id, shop_id)
);
CREATE INDEX IF NOT EXISTS shop_observation_history ON shop_observation(shop_id,source_as_of);
CREATE TABLE IF NOT EXISTS review_period (
 snapshot_id TEXT NOT NULL, shop_id TEXT NOT NULL,
 grain TEXT NOT NULL CHECK(grain IN ('month','week')), period_start TEXT NOT NULL,
 observed_reviews INTEGER CHECK(observed_reviews IS NULL OR observed_reviews>=0),
 estimated_sales REAL CHECK(estimated_sales IS NULL OR estimated_sales>=0),
 data_json TEXT NOT NULL CHECK(json_valid(data_json)),
 PRIMARY KEY(snapshot_id,shop_id,grain,period_start),
 FOREIGN KEY(snapshot_id,shop_id) REFERENCES shop_observation(snapshot_id,shop_id)
);
CREATE TABLE IF NOT EXISTS buyer_moment (
 snapshot_id TEXT NOT NULL REFERENCES research_snapshot(id), id TEXT NOT NULL,
 label TEXT NOT NULL, group_id TEXT, source_as_of TEXT,
 data_json TEXT NOT NULL CHECK(json_valid(data_json)),
 PRIMARY KEY(snapshot_id,id)
);
CREATE INDEX IF NOT EXISTS buyer_moment_group ON buyer_moment(snapshot_id,group_id);
CREATE TABLE IF NOT EXISTS moment_planning_month (
 snapshot_id TEXT NOT NULL, moment_id TEXT NOT NULL,
 month INTEGER NOT NULL CHECK(month BETWEEN 1 AND 12),
 PRIMARY KEY(snapshot_id,moment_id,month),
 FOREIGN KEY(snapshot_id,moment_id) REFERENCES buyer_moment(snapshot_id,id)
);
CREATE VIEW IF NOT EXISTS latest_research_snapshot AS
 SELECT * FROM research_snapshot ORDER BY source_snapshot_at DESC,first_imported_at DESC,id DESC LIMIT 1;
CREATE VIEW IF NOT EXISTS latest_shop_observation AS
 SELECT o.*,s.name,s.url FROM shop_observation o JOIN shop s ON s.id=o.shop_id
 WHERE o.snapshot_id=(SELECT id FROM latest_research_snapshot);
"""


def canonical(value):
    return json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False,allow_nan=False)


def read_assets(directory):
    # Only the normalized schema is accepted; never discover arbitrary local data.
    result={}
    for name in ('manifest','shops','moments','shop-details'):
        path=directory/(name+'.json')
        if path.is_symlink() or not path.is_file():
            raise ValueError(f'Required regular normalized asset missing: {name}')
        result[name]=json.loads(path.read_text())
        if result[name].get('schemaVersion')!=1:
            raise ValueError(f'Unsupported normalized schema: {name}')
    integrity=result['manifest'].get('assetIntegrity')
    if not isinstance(integrity,dict) or result['manifest'].get('assets')!={'shops':'shops.json','moments':'moments.json','shopDetails':'shop-details.json'}:
        raise ValueError('Complete normalized asset integrity manifest required')
    if integrity is not None:
        for key,relative in result['manifest']['assets'].items():
            if relative not in {'shops.json','moments.json','shop-details.json'}:
                raise ValueError('Unknown normalized asset path')
            raw=(directory/relative).read_bytes();expected=integrity.get(key,{})
            if expected.get('sha256')!=hashlib.sha256(raw).hexdigest() or expected.get('bytes')!=len(raw):
                raise ValueError('Normalized asset integrity mismatch')
    return result


def ingest(directory:Path, database:Path):
    assets=read_assets(directory)
    assets['shops']={'schemaVersion':1,'shops':decode_shops(assets['shops'])}
    # Re-rendering the same source is not a new observation. Exclude only the
    # artifact clock, while retaining all source values and source hashes.
    identity={**assets,'manifest':{k:v for k,v in assets['manifest'].items() if k!='builtAt'}}
    snapshot_id=hashlib.sha256(canonical(identity).encode()).hexdigest()
    database.parent.mkdir(parents=True,exist_ok=True)
    con=sqlite3.connect(database,timeout=10)
    try:
        con.execute('PRAGMA foreign_keys=ON')
        version=con.execute('PRAGMA user_version').fetchone()[0]
        if version not in (0,SCHEMA_VERSION):
            raise ValueError('Unsupported future research database schema')
        con.executescript(DDL)
        con.execute(f'PRAGMA user_version={SCHEMA_VERSION}')
        con.execute('BEGIN IMMEDIATE')
        if con.execute('SELECT 1 FROM research_snapshot WHERE id=?',(snapshot_id,)).fetchone():
            con.rollback()
            return {'status':'existing','snapshotId':snapshot_id,'newSnapshot':False}
        manifest=assets['manifest']
        con.execute('INSERT INTO research_snapshot VALUES (?,?,?,?)',
                    (snapshot_id,manifest.get('sourceSnapshotAt'),datetime.now(timezone.utc).isoformat(),canonical(manifest)))
        for shop in assets['shops']['shops']:
            # Name/URL identity can be updated; each snapshot keeps its exact
            # historical fields in data_json and its metrics in typed columns.
            con.execute('INSERT INTO shop VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,url=excluded.url',
                        (shop['id'],shop['name'],shop.get('url')))
            con.execute('INSERT INTO shop_observation VALUES (?,?,?,?,?,?,?)',
                        (snapshot_id,shop['id'],shop.get('sourceAsOf'),shop.get('estimateKind','missing'),
                         shop.get('estimatedDailySales'),shop.get('observedReviews'),canonical(shop)))
        for shop_id,detail in assets['shop-details']['shops'].items():
            for grain,key,datekey in [('month','monthly','month'),('week','weekly','weekStart')]:
                for period in detail.get(key,[]):
                    con.execute('INSERT INTO review_period VALUES (?,?,?,?,?,?,?)',
                        (snapshot_id,shop_id,grain,period[datekey],period.get('observedReviews'),
                         period.get('estimatedSales'),canonical(period)))
        for moment in assets['moments']['moments']:
            con.execute('INSERT INTO buyer_moment VALUES (?,?,?,?,?,?)',
                        (snapshot_id,moment['id'],moment['label'],moment.get('groupId'),moment.get('sourceAsOf'),canonical(moment)))
            for month in moment.get('calendar',{}).get('months',[]):
                con.execute('INSERT INTO moment_planning_month VALUES (?,?,?)',(snapshot_id,moment['id'],month))
        if con.execute('PRAGMA foreign_key_check').fetchall():
            raise ValueError('Research snapshot failed referential integrity')
        con.commit()
        return {'status':'imported','snapshotId':snapshot_id,'newSnapshot':True,
                'shops':len(assets['shops']['shops']),'moments':len(assets['moments']['moments'])}
    except BaseException:
        con.rollback()
        raise
    finally:
        con.close()


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--assets',required=True,type=Path)
    parser.add_argument('--database',required=True,type=Path,help='Private local projection; never publish the SQLite file')
    args=parser.parse_args()
    print(json.dumps(ingest(args.assets,args.database),indent=2))
