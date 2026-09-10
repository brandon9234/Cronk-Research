# Research workspace contract v1

New read model, additive to the legacy public export. Built by `python3 scripts/build_research_workspace.py`. Source inputs are public-safe existing JSON only. No fetching, DB mutations, inferred live freshness, or raw customer data.

All endpoints relative to `assets/research/`. Object keys use camelCase. Missing values are `null`, never false zero. Dates are ISO source observation dates; `builtAt` is only artifact creation time. Every number described as estimated remains estimated.

## `manifest.json` (bootstrap, <1 MB)

`schemaVersion: 1`, stable `snapshotId` (SHA-256 over source identities), `builtAt`, `sourceSnapshotAt`, `sourceDates: {competitorSales, reviews, buyerMoments}`, `counts: {shops, moments, momentGroups, reviews, reviewedListings, shopsWithSeries, shopsWithSupplierSales, shopsWithReviewModel, shopsMissingSales, shopsWithQualifiedMomentum, marketObservationDates}`, `assets: {shops: "shops.json", moments: "moments.json", shopDetails: "shop-details.json"}`, `assetIntegrity: {shops:{bytes,sha256},moments:{bytes,sha256},shopDetails:{bytes,sha256}}`, `quality: [{id,severity,label,detail,count?}]`, `methodology: [{id,label,description}]`, `featuredShops` (first 12 normalized shops), `momentGroups` (all normalized groups), `marketSeries: [{date,estimatedSales}]` (historical supplier-reported series, invalid epoch dates excluded), `sources: [{id,label,asOf,snapshotAt,kind,limitations}]`.

## `shops.json`

Transport: `{schemaVersion:1, encoding:"columnar-dictionary-json", columns:[...], dictionaries:{field:[...]}, rows:[[...],...]}`. This reduces the full 25,878-shop catalog from about 20 MB to 4.8 MB, loaded only on demand. Hydrate named fields with:

```js
const shops = payload.rows.map(values => Object.fromEntries(payload.columns.map((key, i) => {
  const value = values[i];
  return [key, value !== null && payload.dictionaries[key] ? payload.dictionaries[key][value] : value];
})));
```

Python consumers use `cronk_research.workspace.decode_shops(payload)`. The normalized named-field model follows. One canonical case-insensitive Etsy shop-name identity (no TOTAL aggregates). Fields:

`id` stable `shop:<lowercase-name>`, `name`, `url`, `estimatedSales7d`, `estimatedSales30d`, `estimatedDailySales` (supplier 30d/30 when known, otherwise historical review model), `estimateKind` (`supplier-estimate`, `review-model`, `missing`), `observedReviews`, `observedReviews90d`, `observedReviews365d`, `reviewedListings`, `activeListings`, `latestReviewDate`, `reviewsAsOf` (global corpus reference date for 90d/365d counts), `sourceAsOf`, `salesSourceAsOf`, `trendAsOf`, `trend` (historical Rising/Falling/Flat/Insufficient history/No nonzero baseline), `trendDeltaPct`, `trendRecentDailyEstimate`, `trendPriorDailyEstimate`, `method`, `confidence`, `coverageVerified`, `coverageNote`, `trendBasis`, `trendWindow:{recentStart,recentEnd,priorStart,priorEnd}|null`, `hasSeries`, `categories` (array), `qualityFlags` (array).

`sourceAsOf` is date for displayed estimatedDailySales, NOT build date or latest review when supplier data powers the figure. `trendAsOf` is independent. Legacy trend percentages are not passed through: only adjacent full calendar months within the observed review span are eligible, and both must end on or before the shop's last review date. `observedDays` must equal each month's calendar length. Daily rates normalize unequal month lengths; percentage change has a null result for a zero baseline. Rising/Falling use a ±10% descriptive threshold, not statistical significance. No comparable pair means unknown momentum, not flat. This currently permits 95 calendar-month comparisons; collection coverage and statistical significance are **not** verified. Each shop carries `coverageVerified:false` and an explicit `coverageNote`. the other shops retain historical model estimates without a momentum claim. Null-sort last. History does not imply current sales, completed orders, revenue, or a forecast.

## `shop-details.json` (lazy on profile/chart)

`{schemaVersion:1, shops:{"shop:id":{monthly:[{month,observedReviews,estimatedSales,estimatedDailySales,observedDays}],weekly:[{weekStart,observedReviews,estimatedSales}], evidence:[{sourceId,description}]}}}`. Monthly grain is shop × review month; weekly grain is shop × review week. No implicit zeros for absent buckets. Review date is not purchase date; estimated volume anchored to calibration may use a different period. Not every shop has a public series.

## `moments.json`

`{schemaVersion:1, groups:[...], moments:[...]}`. Groups and micro-moments both: `id`, `label`, `groupId` (null for groups), `groupLabel`, `keywords`, `calendar:{startMonthDay,endMonthDay,months:[1..12],kind:"planning-window",yearRound:boolean,source}`, `sourceAsOf`, `listingSampleCount`, `opportunityScore` (legacy heuristic, not measured demand), `tags`, `topListing:{id,title,url}|null`, `qualityFlags`.

Groups also `momentCount`. Calendar windows are inherited planning assumptions, NOT observed seasonality peaks or exact movable holiday dates. Never imply these windows prove current demand. Micro-moment overlap is intentional; do not add search-result totals or overlapping listing counts into a market size.

## Compatibility and integrity

Legacy data/shards remain untouched. Rebuilding is deterministic except explicit `builtAt`; source identities and `snapshotId` do not change when only the build clock changes. The catalog is a snapshot, not a longitudinal shop-sales table. `marketSeriesScope` explicitly marks the inherited market panel as irregular and not verified cohort-comparable. Rebuilding and the build writes a staged asset directory before replacement. Invalid dates, aggregate shop sentinels, duplicate shop identities and impossible numeric values are rejected or quarantined with quality counts. Source file SHA-256 provenance is recorded without local paths. No new sales forecast is introduced. Sorting, comparisons and charts must disclose source dates and evidence type.

## Verification and extension

Run `python3 -m unittest discover -s tests -p 'test_research_workspace.py' -v` and `python3 scripts/build_research_workspace.py`. `validate_read_model(outputsByFilename)` validates decoded identity/count consistency. `build()` validates staged JSON and bootstrap budget before replacement, emits asset SHA-256 digests, and promotes manifest last. Source DBs, caches, and legacy payloads are read-only.

The source export presently contains supplier 30-day estimates for 184 real shops, versus 25,878 shops with review/model coverage. These are different populations. The review corpus count is a source-reported ledger count, not a sum of this view's sample. The 23-date market series is a legacy public panel, not the canonical SQL count of observed shop-days; never substitute one count for the other.

Add future versioned facts by grain (shop × observation date, listing × capture, review × listing, moment × keyword/listing match). Do not backfill unknown daily sales from a review multiplier, turn review dates into purchase dates, or infer a current trend from old snapshots. New ingestion requires separate source/pipeline scope and validation.

`observedDays` is inherited boundary-overlap metadata: it measures how much of a calendar month lies between first and last observed review dates. It is not evidence that every day or review was collected. `trendBasis` is `adjacent-calendar-months-within-observed-span`; the backward-compatible `shopsWithQualifiedMomentum` count means calendar eligibility only.

`decode_shops()` rejects duplicate columns, ragged rows and negative, noninteger, boolean, or out-of-range dictionary indices. `validate_read_model()` additionally rejects orphan detail/moment references, duplicate entity/period identities, count disagreement, and invalid negative/nonfinite metrics (signed percentage changes remain allowed).
