"""Normalize public snapshot data without changing or refreshing its sources.

This module deliberately does not open SQL databases, fetch remote data, or infer
purchase dates from reviews. Each grain and source-date boundary is explicit.
"""
from __future__ import annotations

from collections import Counter, defaultdict
from datetime import date, datetime, timezone
import calendar
import hashlib
import html
import json
import math
from pathlib import Path
import re
import tempfile
from urllib.parse import quote

SCHEMA_VERSION = 1
AGGREGATES = {'total', 'grand total', 'all shops', 'market total'}


def number(value, *, nonnegative=True):
    if value is None or isinstance(value, bool) or value == '':
        return None
    try:
        result = float(value)
    except (ValueError, TypeError):
        return None
    if not math.isfinite(result) or (nonnegative and result < 0):
        return None
    return int(result) if result.is_integer() else round(result, 4)


def source_date(value):
    """Reject epoch placeholders and invalid dates, never fall back to build time."""
    if not isinstance(value, str):
        return None
    try:
        parsed = date.fromisoformat(value[:10])
        return parsed.isoformat() if 2005 <= parsed.year <= 2100 else None
    except ValueError:
        return None


def text(value):
    return html.unescape(str(value or '')).strip()


def shop_identity(name):
    name = text(name)
    if not name or name.casefold() in AGGREGATES:
        return None
    # Etsy names cannot contain path separators. Reject source artefacts outright.
    if not re.fullmatch(r'[A-Za-z0-9_ -]+', name):
        return None
    return 'shop:' + name.casefold()


def normalized_calendar(raw):
    raw = raw or {}
    start, end = raw.get('startMonthDay'), raw.get('endMonthDay')
    try:
        a, b = date.fromisoformat('2000-' + start), date.fromisoformat('2000-' + end)
    except (ValueError, TypeError):
        return {'startMonthDay': None, 'endMonthDay': None, 'months': [],
                'kind': 'planning-window', 'yearRound': False,
                'source': 'Legacy buyer-moment calendar; invalid or missing window'}
    months = []
    for month in range(1, 13):
        low, high = date(2000, month, 1), date(2000, month, calendar.monthrange(2000, month)[1])
        overlaps = low <= b and high >= a if a <= b else high >= a or low <= b
        if overlaps:
            months.append(month)
    return {'startMonthDay': start, 'endMonthDay': end, 'months': months,
            'kind': 'planning-window', 'yearRound': start == '01-01' and end == '12-31',
            'source': 'Legacy buyer-moment planning calendar; not measured demand or exact holiday dates'}


class PublicInputs:
    def __init__(self, asset_dir):
        self.root = Path(asset_dir).resolve()
        self.provenance = []

    def read(self, relative):
        path = (self.root / relative).resolve()
        if not path.is_relative_to(self.root):
            raise ValueError('Asset pointer escapes public source directory')
        raw = path.read_bytes()
        self.provenance.append({'asset': str(path.relative_to(self.root)),
                                'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)})
        return json.loads(raw)


def _indexed(rows, name_key, counters, kind):
    result = {}
    for row in rows:
        key = shop_identity(row.get(name_key))
        if key is None:
            counters['excludedShopRows'] += 1
            continue
        if key in result:
            counters['duplicateShopRows'] += 1
            # Equal grains must never be summed. An exact duplicate is benign;
            # conflicting values are evidence uncertainty rather than hidden overwrite.
            if result[key] != row:
                counters['conflictingShopRows'] += 1
                raise ValueError(f'Conflicting shop identity in {kind}: {key}')
            continue
        result[key] = row
    return result


def normalize_shops(data, trend_data, coverage_rows, counters):
    trends = _indexed(trend_data.get('shopTrends', []), 'Shop', counters, 'trend')
    reviews = _indexed(coverage_rows, 's', counters, 'review')
    rollups = _indexed(data.get('reviewCorpus', {}).get('shopRollup', []), 'Shop', counters, 'rollup')
    suppliers = _indexed(data.get('market', {}).get('topShops', []), 'Shop', counters, 'supplier')
    categories = defaultdict(set)
    for section in ['topListings', 'categoryListings', 'myShopListings']:
        for row in data.get('listing', {}).get(section, []):
            key, category = shop_identity(row.get('Shop')), text(row.get('Product Category'))
            if key and category:
                categories[key].add(category)
    sales_date = source_date(data.get('metrics', {}).get('latestDate'))
    shops = []
    for key in sorted(set(trends) | set(reviews) | set(suppliers) | set(rollups)):
        t, r, s, old = trends.get(key, {}), reviews.get(key, {}), suppliers.get(key, {}), rollups.get(key, {})
        def rv(short, long):
            return number(r.get(short)) if r.get(short) not in (None, '') else number(old.get(long))
        name = text(s.get('Shop') or r.get('s') or t.get('Shop') or old.get('Shop'))
        supplier30 = number(s.get('30D Sales'))
        if supplier30 is None:
            supplier30 = rv('e30', 'eRank 30D Sales')
        supplier7 = number(s.get('7D Sales'))
        if supplier7 is None:
            supplier7 = number(old.get('eRank 7D Sales'))
        trend_date = source_date(t.get('Latest Complete Date'))
        latest_review = source_date(r.get('lr') or old.get('Review Corpus Latest ISO'))
        modeled_daily = number(t.get('Recent Avg Daily Sales'))
        estimate_kind = 'supplier-estimate' if supplier30 is not None else 'review-model' if modeled_daily is not None else 'missing'
        daily = round(supplier30 / 30, 2) if supplier30 is not None else modeled_daily
        flags = ['historical-evidence', 'review-date-is-not-purchase-date']
        confidence = text(t.get('Trend Confidence')) or 'Unknown'
        if 'fallback' in confidence.lower():
            flags.append('global-multiplier-estimate')
        if trend_date is None:
            flags.append('missing-trend-date')
        if estimate_kind == 'supplier-estimate' and sales_date is None:
            flags.append('missing-sales-date')
        if number(t.get('Review Count')) is not None and number(t.get('Review Count')) < 30:
            flags.append('sparse-trend-evidence')
        shops.append({'id': key, 'name': name, 'url': 'https://www.etsy.com/shop/' + quote(name),
                      'estimatedSales7d': supplier7, 'estimatedSales30d': supplier30,
                      'estimatedDailySales': daily, 'estimateKind': estimate_kind,
                      'observedReviews': rv('rc', 'Review Corpus Count'),
                      'observedReviews90d': rv('r90', 'Review Corpus 90D'),
                      'observedReviews365d': rv('r365', 'Review Corpus 365D'),
                      'reviewedListings': rv('rl', 'Review Corpus Listings'),
                      'activeListings': number(s.get('Active Listings')) if s.get('Active Listings') not in (None, '') else rv('al', 'Active Listings'),
                      'latestReviewDate': latest_review, 'reviewsAsOf': source_date(data.get('reviewCorpus', {}).get('latestReviewISO')), 'sourceAsOf': sales_date if supplier30 is not None else trend_date,
                      'salesSourceAsOf': sales_date if supplier30 is not None else None,
                      'trendAsOf': trend_date, 'trend': text(t.get('Trend')) or 'Unknown',
                      'trendDeltaPct': number(t.get('Delta %'), nonnegative=False),
                      'trendRecentDailyEstimate': modeled_daily, 'trendPriorDailyEstimate': number(t.get('Prior Avg Daily Sales')),
                      'method': text(t.get('Trend Source')) or 'No calibrated review model available',
                      'confidence': confidence, 'hasSeries': False,
                      'categories': sorted(categories[key]), 'qualityFlags': flags})
    shops.sort(key=lambda x: (x['estimatedDailySales'] is None, -(x['estimatedDailySales'] or 0), x['id']))
    return shops


def normalize_details(data, trend_data, shops, counters):
    details = defaultdict(lambda: {'monthly': [], 'weekly': [], 'evidence': []})
    seen_month, seen_week = {}, {}
    known = {s['id'] for s in shops}
    for row in trend_data.get('shopTrendChart', []):
        key, month = shop_identity(row.get('Shop')), text(row.get('Month'))
        if key not in known or not re.fullmatch(r'20\d\d-(0[1-9]|1[0-2])', month):
            counters['invalidSeriesRows'] += 1
            continue
        record = {'month': month, 'observedReviews': number(row.get('Review Count')),
                  'estimatedSales': number(row.get('Estimated Monthly Sales')),
                  'estimatedDailySales': number(row.get('Daily Sales')),
                  'observedDays': number(row.get('Observed Days'))}
        pair = (key, month)
        if pair in seen_month:
            counters['duplicateSeriesRows'] += 1
            if seen_month[pair] != record:
                raise ValueError(f'Conflicting shop/month grain: {pair}')
            continue
        seen_month[pair] = record
        details[key]['monthly'].append(record)
    # Review-only monthly points can safely fill absent modeled months.
    for row in data.get('reviewCorpus', {}).get('shopMonthly', []):
        key, month = shop_identity(row.get('Shop')), text(row.get('Month'))
        if key in known and (key, month) not in seen_month and re.fullmatch(r'20\d\d-(0[1-9]|1[0-2])', month):
            record = {'month': month, 'observedReviews': number(row.get('Review Count')), 'estimatedSales': None, 'estimatedDailySales': None, 'observedDays': None}
            seen_month[(key, month)] = record
            details[key]['monthly'].append(record)
    for row in data.get('reviewCorpus', {}).get('shopWeeklySales', []):
        key, day = shop_identity(row.get('Shop')), source_date(row.get('Week Start'))
        if key not in known or day is None:
            counters['invalidSeriesRows'] += 1
            continue
        record = {'weekStart': day, 'observedReviews': number(row.get('Review Count')), 'estimatedSales': number(row.get('Estimated Weekly Sales'))}
        if (key, day) in seen_week:
            counters['duplicateSeriesRows'] += 1
            if seen_week[(key, day)] != record:
                raise ValueError(f'Conflicting shop/week grain: {(key, day)}')
            continue
        seen_week[(key, day)] = record
        details[key]['weekly'].append(record)
    for key, detail in details.items():
        detail['monthly'].sort(key=lambda r: r['month'])
        detail['weekly'].sort(key=lambda r: r['weekStart'])
        detail['evidence'] = [{'sourceId': 'review-corpus', 'description': 'Observed public reviews grouped by review date. Review timing lags purchases; sampled coverage is incomplete.'}, {'sourceId': 'legacy-review-model', 'description': 'Estimated sales multiply observed reviews by legacy calibration. Calibration is not realized sales or a purchase-date reconstruction.'}]
    for shop in shops:
        shop['hasSeries'] = shop['id'] in details
    return dict(sorted(details.items()))


def qualify_trends(shops, details):
    """Compare adjacent full calendar months within the observed review span.

    observedDays is a boundary-overlap calculation, not a collection receipt.
    Sampling completeness and statistical significance remain unverified even
    when each month fits wholly within the observed span.
    """
    qualified = 0
    for shop in shops:
        shop.update({'trend': 'Insufficient history', 'trendDeltaPct': None,
                     'trendRecentDailyEstimate': None, 'trendPriorDailyEstimate': None,
                     'trendAsOf': None, 'trendBasis': 'insufficient-complete-months',
                     'trendWindow': None, 'coverageVerified': False,
                     'coverageNote': 'Full calendar months within observed review span; sampling completeness unverified.'})
        points = details.get(shop['id'], {}).get('monthly', [])
        complete = []
        review_cutoff = source_date(shop.get('latestReviewDate')) or shop.get('reviewsAsOf')
        for point in points:
            year, month = map(int, point['month'].split('-'))
            days = calendar.monthrange(year, month)[1]
            end = date(year, month, days).isoformat()
            if point['observedDays'] != days or point['estimatedSales'] is None:
                continue
            if not review_cutoff or end > review_cutoff:
                continue
            complete.append((point, days, end))
        if len(complete) < 2:
            continue
        prior, recent = complete[-2:]
        py, pm = map(int, prior[0]['month'].split('-'))
        ry, rm = map(int, recent[0]['month'].split('-'))
        if ry * 12 + rm != py * 12 + pm + 1:
            continue
        previous = prior[0]['estimatedSales'] / prior[1]
        current = recent[0]['estimatedSales'] / recent[1]
        delta = round((current / previous - 1) * 100, 2) if previous > 0 else None
        shop.update({'trend': ('Rising' if delta > 10 else 'Falling' if delta < -10 else 'Flat') if delta is not None else 'No nonzero baseline',
                     'trendDeltaPct': delta, 'trendRecentDailyEstimate': round(current, 4),
                     'trendPriorDailyEstimate': round(previous, 4), 'trendAsOf': recent[2],
                     'trendBasis': 'adjacent-calendar-months-within-observed-span',
                     'trendWindow': {'recentStart': recent[0]['month'] + '-01', 'recentEnd': recent[2],
                                     'priorStart': prior[0]['month'] + '-01', 'priorEnd': prior[2]}})
        qualified += 1
    return qualified


def decode_shops(payload):
    """Strictly hydrate columnar transport without accepting invalid references."""
    if not isinstance(payload, dict):
        raise ValueError('Invalid shop payload object')
    if 'shops' in payload:
        rows = payload['shops']
        if not isinstance(rows, list) or any(not isinstance(row, dict) for row in rows):
            raise ValueError('Invalid normalized shop objects')
        return rows
    columns, rows = payload.get('columns'), payload.get('rows')
    dictionaries = payload.get('dictionaries', {})
    if not isinstance(columns, list) or any(not isinstance(key, str) or not key for key in columns):
        raise ValueError('Invalid shop columns')
    if len(set(columns)) != len(columns):
        raise ValueError('Duplicate shop columns')
    if not isinstance(rows, list) or (rows and not columns):
        raise ValueError('Invalid shop row array')
    if not isinstance(dictionaries, dict) or any(key not in columns or not isinstance(value, list) for key, value in dictionaries.items()):
        raise ValueError('Invalid shop dictionaries')
    result = []
    for values in rows:
        if not isinstance(values, list) or len(values) != len(columns):
            raise ValueError('Invalid normalized shop columnar row')
        row = {}
        for key, value in zip(columns, values):
            if key in dictionaries and value is not None:
                if type(value) is not int or not 0 <= value < len(dictionaries[key]):
                    raise ValueError('Invalid shop dictionary index: ' + key)
                value = dictionaries[key][value]
            row[key] = value
        result.append(row)
    return result


def validate_read_model(outputs):
    """Validate parsed public objects before storage or publication.

    Integrity of the original file bytes is checked by the caller against the
    manifest. This function checks semantic grain, references, and metric bounds.
    """
    names = ['manifest.json', 'shops.json', 'moments.json', 'shop-details.json']
    if any(not isinstance(outputs.get(name), dict) or outputs[name].get('schemaVersion') != SCHEMA_VERSION for name in names):
        raise ValueError('Missing or unsupported read model schema')
    manifest = outputs['manifest.json']
    counts = manifest.get('counts', {})
    shops = decode_shops(outputs['shops.json'])
    moments = outputs['moments.json']
    details = outputs['shop-details.json'].get('shops')

    def metric(value, label, signed=False):
        if value is not None and (type(value) not in (int, float) or not math.isfinite(value) or (value < 0 and not signed)):
            raise ValueError('Invalid numeric metric: ' + label)

    def unique_ids(rows, label):
        if not isinstance(rows, list) or any(not isinstance(row, dict) or not isinstance(row.get('id'), str) or not row['id'] for row in rows):
            raise ValueError('Invalid ' + label + ' identities')
        ids = {row['id'] for row in rows}
        if len(ids) != len(rows):
            raise ValueError('Duplicate ' + label + ' identity')
        return ids

    for key, value in counts.items():
        metric(value, 'counts.' + key)
    shop_ids = unique_ids(shops, 'shop')
    if len(shops) != counts.get('shops'):
        raise ValueError('Shop count mismatch')
    for shop in shops:
        for key in ['estimatedSales7d', 'estimatedSales30d', 'estimatedDailySales', 'observedReviews', 'observedReviews90d', 'observedReviews365d', 'reviewedListings', 'activeListings', 'trendRecentDailyEstimate', 'trendPriorDailyEstimate']:
            metric(shop.get(key), 'shop.' + key)
        metric(shop.get('trendDeltaPct'), 'shop.trendDeltaPct', signed=True)
        if shop.get('estimateKind') not in {'supplier-estimate', 'review-model', 'missing'}:
            raise ValueError('Unknown shop estimate kind')
    group_rows, moment_rows = moments.get('groups'), moments.get('moments')
    group_ids = unique_ids(group_rows, 'moment group')
    unique_ids(moment_rows, 'moment')
    if len(moment_rows) != counts.get('moments') or len(group_rows) != counts.get('momentGroups'):
        raise ValueError('Moment count mismatch')
    if any(m.get('groupId') not in group_ids for m in moment_rows):
        raise ValueError('Orphan moment')
    for moment in group_rows + moment_rows:
        for key in ['listingSampleCount', 'opportunityScore', 'momentCount']:
            metric(moment.get(key), 'moment.' + key)
        months = moment.get('calendar', {}).get('months', [])
        if not isinstance(months, list) or len(months) != len(set(months)) or any(type(month) is not int or not 1 <= month <= 12 for month in months):
            raise ValueError('Invalid moment planning months')
    kinds = Counter(s['estimateKind'] for s in shops)
    for kind, count_field in [('supplier-estimate', 'shopsWithSupplierSales'), ('review-model', 'shopsWithReviewModel'), ('missing', 'shopsMissingSales')]:
        if kinds[kind] != counts.get(count_field):
            raise ValueError('Shop estimate kind count mismatch: ' + kind)
    if not isinstance(details, dict) or any(key not in shop_ids for key in details):
        raise ValueError('Orphan shop detail')
    if len(details) != counts.get('shopsWithSeries'):
        raise ValueError('Shop series count mismatch')
    for shop_id, detail in details.items():
        if not isinstance(detail, dict):
            raise ValueError('Invalid shop detail')
        for grain, period_key in [('monthly', 'month'), ('weekly', 'weekStart')]:
            points = detail.get(grain, [])
            if not isinstance(points, list):
                raise ValueError('Invalid detail series')
            periods = set()
            for point in points:
                if not isinstance(point, dict) or not isinstance(point.get(period_key), str):
                    raise ValueError('Invalid detail period')
                period = point[period_key]
                if period in periods:
                    raise ValueError('Duplicate shop detail period')
                periods.add(period)
                for key in ['observedReviews', 'estimatedSales', 'estimatedDailySales', 'observedDays']:
                    metric(point.get(key), 'detail.' + key)
    return {'ok': True, 'shops': len(shops), 'moments': len(moment_rows)}


def normalize_moments(buyer, as_of, counters):
    def convert(row, group=False):
        raw_id = text(row.get('id'))
        if not raw_id or not re.fullmatch(r'[a-zA-Z0-9_-]+', raw_id):
            raise ValueError('Missing/unsafe moment identity')
        stats = row.get('stats', {})
        listing_id = number(row.get('topListingId'))
        title = text(row.get('topTitle'))
        return {'id': raw_id, 'label': text(row.get('label')),
                'groupId': None if group else text(row.get('parentId')) or None,
                'groupLabel': text(row.get('label') if group else row.get('parentLabel')),
                'keywords': sorted(set(text(x) for x in row.get('keywords', []) if text(x))),
                'calendar': normalized_calendar(row.get('calendar')), 'sourceAsOf': as_of,
                'listingSampleCount': number(stats.get('Selected Listing Rows')),
                'opportunityScore': number(row.get('Buyer Moment Opportunity Score', stats.get('Buyer Moment Opportunity Score'))),
                'tags': sorted(set(x.strip() for x in text(row.get('Buyer Moment Tags')).split(';') if x.strip())),
                'topListing': {'id': str(int(listing_id)), 'title': title, 'url': f'https://www.etsy.com/listing/{int(listing_id)}'} if listing_id and title else None,
                'qualityFlags': ['planning-window-not-observed-demand', 'overlapping-keyword-samples', 'legacy-heuristic-score']}
    def dedup(rows, group=False):
        result = {}
        for row in rows:
            converted = convert(row, group)
            if converted['id'] in result:
                counters['duplicateMomentRows'] += 1
                if result[converted['id']] != converted:
                    raise ValueError('Conflicting moment identity: ' + converted['id'])
            else:
                result[converted['id']] = converted
        return list(result.values())
    groups, moments = dedup(buyer.get('groups', []), True), dedup(buyer.get('moments', []))
    group_ids = {g['id'] for g in groups}
    for moment in moments:
        if moment['groupId'] not in group_ids:
            raise ValueError('Orphan moment: ' + moment['id'])
    count = Counter(m['groupId'] for m in moments)
    for group in groups:
        group['momentCount'] = count[group['id']]
    return sorted(groups, key=lambda r: r['label'].casefold()), sorted(moments, key=lambda r: (r['groupId'], r['id']))


def normalize(data, trend_data, buyer, coverage_rows, built_at):
    counters = Counter()
    reviews = data.get('reviewCorpus', {})
    source_dates = {'competitorSales': source_date(data.get('metrics', {}).get('latestDate')),
                    'reviews': source_date(reviews.get('latestReviewISO')), 'buyerMoments': None}
    for row in data.get('operations', {}).get('dataFreshness', []):
        if row.get('Source') == 'Buyer moment workbook cache':
            source_dates['buyerMoments'] = source_date(row.get('Data Through'))
    shops = normalize_shops(data, trend_data, coverage_rows, counters)
    details = normalize_details(data, trend_data, shops, counters)
    qualified_trends = qualify_trends(shops, details)
    groups, moments = normalize_moments(buyer, source_dates['buyerMoments'], counters)
    market = {}
    for row in data.get('market', {}).get('dailyTrend', []):
        day, value = source_date(row.get('Date')), number(row.get('Daily Sales'))
        if not day or value is None or (source_dates['competitorSales'] and day > source_dates['competitorSales']):
            counters['invalidMarketRows'] += 1
            continue
        if day in market and market[day] != value:
            raise ValueError('Conflicting market/day grain: ' + day)
        market[day] = value
    quality = [
        {'id': 'historical-snapshot', 'severity': 'warning', 'label': 'Historical snapshot', 'detail': 'A rebuilt dashboard does not refresh the evidence. Supplier sales, review observations and buyer-moment capture dates are tracked separately.'},
        {'id': 'modeled-sales', 'severity': 'warning', 'label': 'Estimated sales, observed reviews', 'detail': 'Competitor sales are supplier estimates or review-derived models. None are verified order counts, realized revenue, or forecasts.'},
        {'id': 'calendar-assumptions', 'severity': 'info', 'label': 'Planning calendar', 'detail': 'Buyer-moment windows are inherited planning assumptions, not observed demand peaks or exact annual holiday dates.'},
        {'id': 'partial-series', 'severity': 'info', 'label': 'Partial chart coverage', 'detail': f'Public time-series detail is available for {len(details):,} of {len(shops):,} shops. Missing chart points are not zero.', 'count': len(details)},
        {'id': 'filtered-artifacts', 'severity': 'info', 'label': 'Source artifacts excluded', 'detail': 'Aggregate shop labels and invalid market dates were excluded from entity metrics. Duplicate grains are not summed.', 'count': counters['excludedShopRows'] + counters['invalidMarketRows']},
    ]
    methods = [
        {'id': 'supplier-estimate', 'label': 'Supplier estimate', 'description': 'Imported eRank 7-day/30-day sales estimates at the supplier source date; daily rate is 30-day estimate divided by 30.'},
        {'id': 'review-model', 'label': 'Review model', 'description': 'Legacy review-volume estimate calibrated to eRank, lifetime shop totals, or a global fallback. Daily-rate estimates preserve the legacy historical model. Momentum compares adjacent full calendar months within the observed review span. Sampling completeness and statistical significance remain unverified; absent eligible calendar history is unknown, not flat.'},
        {'id': 'observed-reviews', 'label': 'Observed reviews', 'description': 'Counts of captured public reviews. Review dates may lag purchases; capture gaps and missing reviews limit coverage. Windows use the legacy corpus reference date.'},
        {'id': 'moment-score', 'label': 'Opportunity score', 'description': 'Legacy keyword/listing heuristic, not measured demand or market share. Overlapping keywords and selected listing samples cannot be summed as market size.'},
    ]
    manifest = {'schemaVersion': SCHEMA_VERSION, 'builtAt': built_at,
                'sourceSnapshotAt': data.get('meta', {}).get('generatedAt'), 'sourceDates': source_dates,
                'counts': {'shops': len(shops), 'moments': len(moments), 'momentGroups': len(groups), 'reviews': number(reviews.get('totalReviews')), 'reviewedListings': number(reviews.get('uniqueListingUrls')), 'shopsWithSeries': len(details), 'shopsWithSupplierSales': sum(s['estimateKind'] == 'supplier-estimate' for s in shops), 'shopsWithReviewModel': sum(s['estimateKind'] == 'review-model' for s in shops), 'shopsMissingSales': sum(s['estimateKind'] == 'missing' for s in shops), 'marketObservationDates': len(market), 'shopsWithQualifiedMomentum': qualified_trends},
                'assets': {'shops': 'shops.json', 'moments': 'moments.json', 'shopDetails': 'shop-details.json'},
                'quality': quality, 'methodology': methods, 'featuredShops': shops[:12], 'momentGroups': groups,
                'marketSeries': [{'date': k, 'estimatedSales': v} for k, v in sorted(market.items())],
                'marketSeriesScope': {'kind': 'legacy-supplier-panel', 'observations': len(market), 'start': min(market) if market else None, 'end': max(market) if market else None, 'completeDailyCoverage': False, 'comparableCohortVerified': False, 'limitations': 'Irregular imported panel. Coverage and shop composition may change by date. Do not interpret this aggregate series as total Etsy demand or current sales.'},
                'sources': [{'id': 'supplier', 'label': 'eRank competitor snapshot', 'asOf': source_dates['competitorSales'], 'snapshotAt': data.get('meta', {}).get('sourceWorkbookModifiedAt'), 'kind': 'supplier-estimate', 'limitations': 'Imported historical coverage; not live Etsy orders.'},
                            {'id': 'review-corpus', 'label': 'Public Etsy review corpus', 'asOf': source_dates['reviews'], 'snapshotAt': reviews.get('generatedAt'), 'kind': 'observed-reviews', 'limitations': 'Source observation date differs from capture/export time. Review timing is not purchase timing.'},
                            {'id': 'buyer-moments', 'label': 'Buyer-moment taxonomy and listing samples', 'asOf': source_dates['buyerMoments'], 'snapshotAt': data.get('buyerMoments', {}).get('generatedAt'), 'kind': 'planning-taxonomy', 'limitations': 'Calendar windows and heuristic scores require validation; sample overlap is expected.'}],
                'normalization': dict(sorted(counters.items()))}
    return {'manifest.json': manifest, 'shops.json': {'schemaVersion': 1, 'shops': shops}, 'shop-details.json': {'schemaVersion': 1, 'shops': details}, 'moments.json': {'schemaVersion': 1, 'groups': groups, 'moments': moments}}


def build(asset_dir, output_dir=None, *, built_at=None):
    inputs = PublicInputs(asset_dir)
    data = inputs.read('data.json')
    comparison = data.get('comparison', {})
    trend_data = inputs.read(comparison['shopTrendsAsset']) if comparison.get('shopTrendsAsset') else comparison
    buyer_meta = data.get('buyerMoments', {})
    buyer = inputs.read(buyer_meta['detailAsset']).get('buyerMoments', {}) if buyer_meta.get('detailAsset') else buyer_meta
    coverage_rows = []
    coverage = data.get('listing', {}).get('reviewShopCoverageIndex', {})
    for relative in coverage.get('rowFiles', []):
        chunk = inputs.read(relative)
        cols = chunk.get('columns', coverage.get('rowColumns', []))
        for row in chunk.get('rows', []):
            if not isinstance(row, list) or len(row) != len(cols):
                raise ValueError('Invalid columnar shop coverage row')
            coverage_rows.append(dict(zip(cols, row)))
    built_at = built_at or datetime.now(timezone.utc).isoformat(timespec='seconds')
    outputs = normalize(data, trend_data, buyer, coverage_rows, built_at)
    outputs['manifest.json']['sourceFiles'] = inputs.provenance
    source_identity = json.dumps({'schemaVersion': SCHEMA_VERSION, 'sourceFiles': inputs.provenance}, sort_keys=True, separators=(',', ':')).encode()
    outputs['manifest.json']['snapshotId'] = 'snapshot:' + hashlib.sha256(source_identity).hexdigest()[:24]
    # Columnar transport retains the documented named-field row model while
    # reducing a ~20 MB object catalog to a small lazy view asset.
    shop_rows = outputs['shops.json'].pop('shops')
    columns = list(shop_rows[0]) if shop_rows else []
    dictionaries = {}
    for field in ['estimateKind', 'method', 'confidence', 'qualityFlags', 'categories', 'trend', 'sourceAsOf', 'salesSourceAsOf', 'trendAsOf', 'reviewsAsOf', 'trendBasis', 'trendWindow', 'coverageNote']:
        if field not in columns:
            continue
        unique = sorted({json.dumps(row[field], sort_keys=True) for row in shop_rows if row[field] is not None})
        dictionaries[field] = [json.loads(value) for value in unique]
    indexes = {field: {json.dumps(value, sort_keys=True): i for i, value in enumerate(values)} for field, values in dictionaries.items()}
    transport = [[indexes[k][json.dumps(row[k], sort_keys=True)] if k in indexes and row[k] is not None else row[k] for k in columns] for row in shop_rows]
    outputs['shops.json'].update({'encoding': 'columnar-dictionary-json', 'columns': columns, 'dictionaries': dictionaries, 'rows': transport})
    validate_read_model(outputs)
    encoded = {name: json.dumps(value, ensure_ascii=False, separators=(',', ':'), allow_nan=False).encode() for name, value in outputs.items()}
    outputs['manifest.json']['assetIntegrity'] = {key: {'bytes': len(encoded[name]), 'sha256': hashlib.sha256(encoded[name]).hexdigest()} for key, name in outputs['manifest.json']['assets'].items()}
    encoded['manifest.json'] = json.dumps(outputs['manifest.json'], ensure_ascii=False, separators=(',', ':'), allow_nan=False).encode()
    if len(encoded['manifest.json']) > 1_000_000:
        raise ValueError('Research bootstrap exceeds 1 MB budget')
    target = Path(output_dir) if output_dir else Path(asset_dir) / 'research'
    target.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.research-stage-', dir=target.parent) as temp:
        stage = Path(temp)
        for name, raw in encoded.items():
            if b'/Users/' in raw or b'file://' in raw:
                raise ValueError('Local path leaked into public read model')
            (stage / name).write_bytes(raw)
        # Validate all staged JSON before a single target file is changed. Manifest
        # promoted last so consumers never receive pointers before their assets.
        target.mkdir(parents=True, exist_ok=True)
        for name in ['shops.json', 'moments.json', 'shop-details.json', 'manifest.json']:
            (stage / name).replace(target / name)
    return {'counts': outputs['manifest.json']['counts'], 'sourceDates': outputs['manifest.json']['sourceDates'], 'normalization': outputs['manifest.json']['normalization'], 'bytes': {k: len(v) for k, v in encoded.items()}}
