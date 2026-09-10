# Cronk Research architecture

The workspace turns existing public research evidence into a small, versioned read model. Collection remains separate from analysis and presentation. A dashboard rebuild never advances the observation dates.

## Layers

1. **Source evidence**: historical supplier sales snapshots, captured Etsy reviews, buyer-moment workbook taxonomy and existing public-safe listing metadata. Private SQLite stores and workbooks remain unchanged.
2. **Legacy export**: existing enriched `assets/data.json` and its declared shards. Advanced research retains access to this broader material through `classic.html` and old `?view=` links.
3. **Normalized model**: `cronk_research/workspace.py` resolves stable shop/moment identities, separates measurement types, preserves missing values, rejects conflicting grains, and assigns actual source dates. Its schema and provenance are explicit.
4. **Optional analytical history**: `research_workspace_store.py` adds transactional snapshots to a local SQLite projection. Shop observations, review periods and planning months have distinct keys and foreign keys. The same evidence rebuilt later does not become another observation. Raw collector databases are never modified by this path.
5. **Workspace UI**: independent ES modules for data loading, pure logic, DOM, charts and views. The first view loads only the compact manifest. Detailed catalogs and chart data load on demand and must match the manifest's byte length and SHA-256.

## Rebuild and verify

From the source project:

```sh
python3 scripts/research_workspace_site.py
python3 scripts/research_workspace_site.py --verify-only
python3 -m unittest discover -s tests -v
python3 scripts/test_research_workspace_store.py
node --test research-workspace/tests/core.test.mjs
```

The portable implementation is also published under `tools/research`. From the public repository, rebuild with:

```sh
python3 tools/research/scripts/research_workspace_site.py --export-dir .
```

Full legacy refresh runs the new projection after final SQL enrichment. Base and atomic staging preserve the classic entrypoint and content-addressed frontend modules; publication rejects missing shards, changed source hashes and stale derived data. No full collector refresh is required for an interface-only change.

To retain local analytical history:

```sh
python3 scripts/research_workspace_store.py --assets github-pages-export/assets/research --database data/research_workspace.sqlite
```

The SQLite file stays local. Query `latest_shop_observation` for current snapshot values or join `review_period` by snapshot/shop/grain/date. Never sum estimates from different sources or snapshots as if they were transactions.

## Evidence semantics

- Supplier estimates are dated third-party snapshots, not live Etsy orders.
- Review counts are observations. Review-derived sales use inherited calibration and are labeled models.
- Momentum compares adjacent full calendar months within the observed span, normalized by month length. Sample completeness and statistical significance are unverified; insufficient series return unknown.
- Review dates can lag purchases and events. Buyer-moment windows are editorial planning assumptions, including recurring and year-round occasions; they are not measured purchase peaks or holiday date forecasts.
- Source dates, snapshot timestamps and interface release versions are different fields. Freshness is computed when viewed, not frozen as “one hour ago.”
- Local watchlists are browser bookmarks. They do not silently subscribe shops to a crawler or claim monitoring is active.

## Future additions

Add metrics in the normalized model with a defined grain, evidence type, source date and completeness rule, then add counterexample fixtures before UI use. The next data work should restore dated supplier ingestion and review collection with bounded source workflows. A collector is a separate owned process; no UI refresh should start it implicitly.

Candidate extensions: same-shop equal-window daily velocity, calibrated uncertainty ranges, evidence-backed seasonal recurrence, configurable research lead times, saved cross-device cohorts, and fresh listing-level benchmark comparisons. Each requires sufficient evidence before becoming a recommendation.
