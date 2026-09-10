"""Regressions for metric boundaries and the public workspace build contract."""
import copy
from datetime import date
import hashlib
import json
from pathlib import Path
import tempfile
import unittest

from cronk_research.workspace import (build, normalize, normalized_calendar, number,
                                       source_date, shop_identity, PublicInputs, qualify_trends, validate_read_model, decode_shops)


def fixture():
    data = {'meta': {'generatedAt': '2026-08-01T12:00:00'},
            'metrics': {'latestDate': '2026-05-29'},
            'market': {'topShops': [{'Shop': 'TOTAL', '30D Sales': 5000}, {'Shop': 'Acme', '30D Sales': 300, '7D Sales': 56}, {'Shop': 'ZeroShop', '30D Sales': 0}], 'dailyTrend': [{'Date': '1970-01-01', 'Daily Sales': 100}, {'Date': '2026-05-29', 'Daily Sales': 10}]},
            'reviewCorpus': {'latestReviewISO': '2026-06-14', 'totalReviews': 55, 'uniqueListingUrls': 4,
                             'shopWeeklySales': [{'Shop': 'ACME', 'Week Start': '2026-05-25', 'Review Count': 2, 'Estimated Weekly Sales': 8}]},
            'operations': {'dataFreshness': [{'Source': 'Buyer moment workbook cache', 'Data Through': '2026-06-01 09:00:00'}]}}
    trends = {'shopTrends': [{'Shop': 'acme', 'Recent Avg Daily Sales': 24, 'Prior Avg Daily Sales': 20, 'Delta %': 20, 'Trend': 'Rising', 'Latest Complete Date': '2026-05-01', 'Trend Confidence': 'Fallback'}, {'Shop': 'ModelShop', 'Recent Avg Daily Sales': 4, 'Latest Complete Date': '2026-05-01'}],
              'shopTrendChart': [{'Shop': 'Acme', 'Month': '2026-05', 'Review Count': 3, 'Estimated Monthly Sales': 12, 'Daily Sales': 0.4, 'Observed Days': 30}]}
    coverage = [{'s': 'ACME', 'rc': 45, 'r90': 10, 'lr': '2026-06-10'}, {'s': 'MissingShop', 'rc': 10}]
    buyer = {'groups': [{'id': 'wedding', 'label': 'Wedding', 'calendar': {'startMonthDay': '04-15', 'endMonthDay': '09-10'}}],
             'moments': [{'id': 'wedding--gift', 'parentId': 'wedding', 'parentLabel': 'Wedding', 'label': 'Wedding gift', 'calendar': {'startMonthDay': '04-15', 'endMonthDay': '09-10'}, 'stats': {'Selected Listing Rows': 10}, 'topListingId': 123.0, 'topTitle': 'Custom gift'}]}
    return data, trends, buyer, coverage


def decode(payload):
    dictionaries = payload.get('dictionaries', {})
    return [{k: dictionaries[k][v] if k in dictionaries and v is not None else v for k, v in zip(payload['columns'], row)} for row in payload['rows']]


class MetricBoundaryTests(unittest.TestCase):
    def run_fixture(self):
        return normalize(*fixture(), '2026-09-09T00:00:00Z')

    def test_missing_is_not_zero(self):
        rows = {r['name'].lower(): r for r in self.run_fixture()['shops.json']['shops']}
        self.assertIsNone(rows['missingshop']['estimatedDailySales'])
        self.assertEqual(rows['zeroshop']['estimatedDailySales'], 0)
        self.assertEqual(rows['zeroshop']['estimateKind'], 'supplier-estimate')
        self.assertIsNone(rows['acme']['activeListings'])

    def test_supplier_and_model_dates_are_independent(self):
        row = next(r for r in self.run_fixture()['shops.json']['shops'] if r['id'] == 'shop:acme')
        self.assertEqual(row['estimatedDailySales'], 10)
        self.assertIsNone(row['trendRecentDailyEstimate'])
        self.assertEqual(row['sourceAsOf'], '2026-05-29')
        self.assertIsNone(row['trendAsOf'])
        self.assertEqual(row['reviewsAsOf'], '2026-06-14')
        self.assertEqual(row['latestReviewDate'], '2026-06-10')

    def test_model_is_not_renamed_supplier_sales(self):
        row = next(r for r in self.run_fixture()['shops.json']['shops'] if r['id'] == 'shop:modelshop')
        self.assertEqual(row['estimateKind'], 'review-model')
        self.assertIsNone(row['estimatedSales30d'])
        self.assertEqual(row['estimatedDailySales'], 4)
        self.assertEqual(row['sourceAsOf'], '2026-05-01')

    def test_counts_describe_different_universes(self):
        counts = self.run_fixture()['manifest.json']['counts']
        self.assertEqual(counts['shops'], 4)
        self.assertEqual(counts['shopsWithSupplierSales'], 2)
        self.assertEqual(counts['shopsWithReviewModel'], 1)
        self.assertEqual(counts['shopsMissingSales'], 1)
        self.assertEqual(counts['shopsWithSeries'], 1)

    def test_no_aggregate_shop_or_epoch_market_date(self):
        result = self.run_fixture()
        self.assertFalse(any(r['name'] == 'TOTAL' for r in result['shops.json']['shops']))
        self.assertEqual(result['manifest.json']['marketSeries'], [{'date': '2026-05-29', 'estimatedSales': 10}])
        self.assertFalse(result['manifest.json']['marketSeriesScope']['comparableCohortVerified'])

    def test_market_future_to_source_cutoff_rejected(self):
        data, trends, buyer, coverage = fixture()
        data['market']['dailyTrend'].append({'Date': '2026-12-31', 'Daily Sales': 99999})
        result = normalize(data, trends, buyer, coverage, '2027-01-01')
        self.assertEqual(len(result['manifest.json']['marketSeries']), 1)

    def test_conflicting_shop_grain_fails_not_first_wins(self):
        data, trends, buyer, coverage = fixture()
        trends['shopTrends'].append({'Shop': 'ACME', 'Recent Avg Daily Sales': 999})
        with self.assertRaisesRegex(ValueError, 'Conflicting shop identity'):
            normalize(data, trends, buyer, coverage, '2026-09-09')

    def test_casefold_joins_without_double_count(self):
        row = next(r for r in self.run_fixture()['shops.json']['shops'] if r['id'] == 'shop:acme')
        self.assertEqual(row['observedReviews'], 45)
        self.assertTrue(row['hasSeries'])

    def test_no_missing_month_zero_fill(self):
        detail = self.run_fixture()['shop-details.json']['shops']['shop:acme']
        self.assertEqual(len(detail['monthly']), 1)
        self.assertEqual(detail['monthly'][0]['observedReviews'], 3)
        self.assertEqual(detail['monthly'][0]['estimatedSales'], 12)

    def test_duplicate_month_not_summed(self):
        data, trends, buyer, coverage = fixture()
        trends['shopTrendChart'] *= 2
        result = normalize(data, trends, buyer, coverage, '2026-09-09')
        self.assertEqual(len(result['shop-details.json']['shops']['shop:acme']['monthly']), 1)
        self.assertEqual(result['manifest.json']['normalization']['duplicateSeriesRows'], 1)

    def test_conflicting_month_fails_closed(self):
        data, trends, buyer, coverage = fixture()
        duplicate = dict(trends['shopTrendChart'][0], **{'Review Count': 999})
        trends['shopTrendChart'].append(duplicate)
        with self.assertRaisesRegex(ValueError, 'Conflicting shop/month'):
            normalize(data, trends, buyer, coverage, '2026-09-09')

    def test_rebuild_does_not_make_source_current(self):
        a = normalize(*fixture(), '2026-09-09')
        b = normalize(*fixture(), '2027-01-01')
        self.assertEqual(a['manifest.json']['sourceDates'], b['manifest.json']['sourceDates'])
        self.assertEqual(a['shops.json'], b['shops.json'])

    def test_pure_transform_preserves_inputs(self):
        args = fixture()
        before = copy.deepcopy(args)
        normalize(*args, '2026-09-09')
        self.assertEqual(args, before)

    def test_invalid_and_nonfinite_numbers_become_unknown(self):
        for value in [None, '', float('nan'), float('inf'), -1, True, 'N/A']:
            self.assertIsNone(number(value))
        self.assertEqual(number(0), 0)
        self.assertEqual(number('-12.5', nonnegative=False), -12.5)


class CompleteMonthMomentumTests(unittest.TestCase):
    def setup_case(self, points):
        shop = {'id': 'shop:acme', 'latestReviewDate': '2026-06-14', 'reviewsAsOf': '2026-06-14'}
        qualify_trends([shop], {'shop:acme': {'monthly': points}})
        return shop

    def test_partial_latest_month_cannot_create_crash_or_spike(self):
        row = self.setup_case([
            {'month': '2026-04', 'observedDays': 30, 'estimatedSales': 300},
            {'month': '2026-05', 'observedDays': 31, 'estimatedSales': 620},
            {'month': '2026-06', 'observedDays': 14, 'estimatedSales': 1}])
        self.assertEqual(row['trendDeltaPct'], 100)
        self.assertEqual(row['trendAsOf'], '2026-05-31')
        self.assertEqual(row['trendWindow']['priorStart'], '2026-04-01')

    def test_equal_daily_rate_different_month_lengths_is_flat(self):
        row = self.setup_case([
            {'month': '2026-04', 'observedDays': 30, 'estimatedSales': 300},
            {'month': '2026-05', 'observedDays': 31, 'estimatedSales': 310}])
        self.assertEqual(row['trendDeltaPct'], 0)
        self.assertEqual(row['trend'], 'Flat')

    def test_missing_consecutive_month_is_unknown(self):
        row = self.setup_case([
            {'month': '2026-03', 'observedDays': 31, 'estimatedSales': 300},
            {'month': '2026-05', 'observedDays': 31, 'estimatedSales': 310}])
        self.assertIsNone(row['trendDeltaPct'])

    def test_zero_baseline_not_infinity(self):
        row = self.setup_case([
            {'month': '2026-04', 'observedDays': 30, 'estimatedSales': 0},
            {'month': '2026-05', 'observedDays': 31, 'estimatedSales': 310}])
        self.assertIsNone(row['trendDeltaPct'])
        self.assertEqual(row['trend'], 'No nonzero baseline')

    def test_full_days_claim_after_review_cutoff_rejected(self):
        row = self.setup_case([
            {'month': '2026-05', 'observedDays': 31, 'estimatedSales': 310},
            {'month': '2026-06', 'observedDays': 30, 'estimatedSales': 600}])
        self.assertIsNone(row['trendDeltaPct'])


class MomentAndIdentityTests(unittest.TestCase):
    def test_cross_year_window(self):
        row = normalized_calendar({'startMonthDay': '11-15', 'endMonthDay': '02-10'})
        self.assertEqual(row['months'], [1, 2, 11, 12])
        self.assertEqual(row['kind'], 'planning-window')

    def test_year_round_not_peak(self):
        row = normalized_calendar({'startMonthDay': '01-01', 'endMonthDay': '12-31'})
        self.assertTrue(row['yearRound'])
        self.assertEqual(row['months'], list(range(1, 13)))
        self.assertIn('not measured demand', row['source'])

    def test_invalid_calendar_does_not_default_year_round(self):
        row = normalized_calendar({'startMonthDay': '02-31', 'endMonthDay': '03-01'})
        self.assertEqual(row['months'], [])
        self.assertIsNone(row['startMonthDay'])

    def test_orphan_moment_fails(self):
        data, trends, buyer, coverage = fixture()
        buyer['moments'][0]['parentId'] = 'unknown'
        with self.assertRaisesRegex(ValueError, 'Orphan'):
            normalize(data, trends, buyer, coverage, '2026-09-09')

    def test_listing_id_and_labels_preserved(self):
        row = normalize(*fixture(), '2026-09-09')['moments.json']['moments'][0]
        self.assertEqual(row['topListing']['url'], 'https://www.etsy.com/listing/123')
        self.assertEqual(row['sourceAsOf'], '2026-06-01')
        self.assertIsNone(row['opportunityScore'])

    def test_shop_identity_rejects_artifacts(self):
        self.assertIsNone(shop_identity(' TOTAL '))
        self.assertIsNone(shop_identity('../secret'))
        self.assertEqual(shop_identity('Acme'), shop_identity('acme'))

    def test_date_parsing_does_not_accept_epoch_or_impossible_dates(self):
        for value in ['1970-01-01', '2026-02-30', None, 'yesterday']:
            self.assertIsNone(source_date(value))


class PublicContractValidationTests(unittest.TestCase):
    def test_dictionary_indices_require_bounded_integers(self):
        for value in [-1, 1, 0.0, '0', True, {}, []]:
            with self.subTest(value=value), self.assertRaises(ValueError):
                decode_shops({'columns': ['name'], 'dictionaries': {'name': ['Acme']}, 'rows': [[value]]})
        self.assertEqual(decode_shops({'columns': ['name'], 'dictionaries': {'name': ['Acme']}, 'rows': [[0], [None]]}), [{'name': 'Acme'}, {'name': None}])

    def test_duplicate_columns_rejected(self):
        with self.assertRaisesRegex(ValueError, 'Duplicate shop columns'):
            decode_shops({'columns': ['id', 'id'], 'rows': [['A', 'B']]})

    def test_extra_dictionary_or_ragged_rows_rejected(self):
        for payload in [{'columns': ['id'], 'dictionaries': {'name': ['A']}, 'rows': [[1]]}, {'columns': ['id'], 'rows': [[]]}, {'columns': ['id'], 'rows': ['X']}]:
            with self.subTest(payload=payload), self.assertRaises(ValueError):
                decode_shops(payload)

    def test_orphan_details_rejected(self):
        outputs = normalize(*fixture(), '2026-09-09')
        outputs['shop-details.json']['shops']['shop:orphan'] = outputs['shop-details.json']['shops'].pop('shop:acme')
        with self.assertRaisesRegex(ValueError, 'Orphan shop detail'):
            validate_read_model(outputs)

    def test_duplicate_moment_ids_rejected(self):
        outputs = normalize(*fixture(), '2026-09-09')
        outputs['moments.json']['moments'] *= 2
        outputs['manifest.json']['counts']['moments'] = 2
        with self.assertRaisesRegex(ValueError, 'Duplicate moment identity'):
            validate_read_model(outputs)

    def test_duplicate_group_ids_rejected(self):
        outputs = normalize(*fixture(), '2026-09-09')
        outputs['moments.json']['groups'] *= 2
        with self.assertRaisesRegex(ValueError, 'Duplicate moment group identity'):
            validate_read_model(outputs)

    def test_shop_negative_or_nonfinite_metric_rejected(self):
        for value in [-1, float('inf'), float('nan'), True, '15']:
            outputs = normalize(*fixture(), '2026-09-09')
            outputs['shops.json']['shops'][0]['observedReviews'] = value
            with self.subTest(value=value), self.assertRaisesRegex(ValueError, 'Invalid numeric metric'):
                validate_read_model(outputs)

    def test_negative_detail_and_moment_metrics_rejected(self):
        outputs = normalize(*fixture(), '2026-09-09')
        outputs['shop-details.json']['shops']['shop:acme']['monthly'][0]['estimatedSales'] = -1
        with self.assertRaisesRegex(ValueError, 'Invalid numeric metric'):
            validate_read_model(outputs)
        outputs = normalize(*fixture(), '2026-09-09')
        outputs['moments.json']['moments'][0]['opportunityScore'] = -1
        with self.assertRaisesRegex(ValueError, 'Invalid numeric metric'):
            validate_read_model(outputs)

    def test_duplicate_detail_period_rejected(self):
        outputs = normalize(*fixture(), '2026-09-09')
        outputs['shop-details.json']['shops']['shop:acme']['monthly'] *= 2
        with self.assertRaisesRegex(ValueError, 'Duplicate shop detail period'):
            validate_read_model(outputs)

    def test_negative_change_is_legitimate(self):
        outputs = normalize(*fixture(), '2026-09-09')
        outputs['shops.json']['shops'][0]['trendDeltaPct'] = -50
        self.assertTrue(validate_read_model(outputs)['ok'])

    def test_calendar_eligibility_does_not_claim_collection_coverage(self):
        outputs = normalize(*fixture(), '2026-09-09')
        self.assertTrue(all(shop['coverageVerified'] is False for shop in outputs['shops.json']['shops']))
        self.assertTrue(all('sampling completeness unverified' in shop['coverageNote'] for shop in outputs['shops.json']['shops']))
        model = next(row for row in outputs['manifest.json']['methodology'] if row['id'] == 'review-model')
        self.assertIn('statistical significance remain unverified', model['description'])


class BuildTests(unittest.TestCase):
    def write_fixture(self, root):
        data, trends, buyer, coverage = fixture()
        data['comparison'] = trends
        data['buyerMoments'] = buyer
        data['reviewCorpus']['shopRollup'] = [{'Shop': r['s'], 'Review Corpus Count': r['rc']} for r in coverage]
        (root / 'data.json').write_text(json.dumps(data))

    def test_reproducible_public_build_and_compact_roundtrip(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            self.write_fixture(root)
            original = (root / 'data.json').read_bytes()
            build(root, built_at='2026-09-09T00:00:00Z')
            files_a = {p.name: p.read_bytes() for p in (root / 'research').glob('*.json')}
            manifest = json.loads(files_a['manifest.json'])
            rows = decode(json.loads(files_a['shops.json']))
            self.assertEqual(len(rows), manifest['counts']['shops'])
            self.assertEqual(next(r for r in rows if r['id'] == 'shop:zeroshop')['estimatedDailySales'], 0)
            self.assertIsNone(next(r for r in rows if r['id'] == 'shop:missingshop')['estimatedDailySales'])
            self.assertLess(len(files_a['manifest.json']), 1_000_000)
            self.assertEqual(manifest['sourceFiles'][0]['sha256'], hashlib.sha256(original).hexdigest())
            for key, name in manifest['assets'].items():
                self.assertEqual(manifest['assetIntegrity'][key]['sha256'], hashlib.sha256(files_a[name]).hexdigest())
                self.assertEqual(manifest['assetIntegrity'][key]['bytes'], len(files_a[name]))
            build(root, built_at='2026-09-09T00:00:00Z')
            self.assertEqual(files_a, {p.name: p.read_bytes() for p in (root / 'research').glob('*.json')})
            self.assertEqual((root / 'data.json').read_bytes(), original)

    def test_empty_build_has_valid_zero_row_transport(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / 'data.json').write_text('{}')
            result = build(root, built_at='2026-09-09')
            outputs = {p.name: json.loads(p.read_text()) for p in (root / 'research').glob('*.json')}
            self.assertEqual(result['counts']['shops'], 0)
            self.assertEqual(result['counts']['moments'], 0)
            self.assertEqual(outputs['shops.json']['columns'], [])
            self.assertEqual(outputs['shops.json']['dictionaries'], {})
            self.assertEqual(outputs['shops.json']['rows'], [])
            self.assertEqual(decode_shops(outputs['shops.json']), [])
            self.assertTrue(validate_read_model(outputs)['ok'])

    def test_snapshot_identity_excludes_build_clock(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            self.write_fixture(root)
            build(root, built_at='2026-09-09')
            a = json.loads((root / 'research/manifest.json').read_text())
            build(root, built_at='2027-01-01')
            b = json.loads((root / 'research/manifest.json').read_text())
            self.assertEqual(a['snapshotId'], b['snapshotId'])
            self.assertNotEqual(a['builtAt'], b['builtAt'])

    def test_asset_pointer_traversal_blocked(self):
        with tempfile.TemporaryDirectory() as temp:
            with self.assertRaisesRegex(ValueError, 'escapes'):
                PublicInputs(temp).read('../outside.json')

    def test_failed_build_preserves_previous_assets(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            self.write_fixture(root)
            build(root, built_at='2026-09-09')
            before = (root / 'research/manifest.json').read_bytes()
            data = json.loads((root / 'data.json').read_text())
            data['buyerMoments']['moments'][0]['parentId'] = 'bad'
            (root / 'data.json').write_text(json.dumps(data))
            with self.assertRaises(ValueError):
                build(root)
            self.assertEqual((root / 'research/manifest.json').read_bytes(), before)


if __name__ == '__main__':
    unittest.main()
