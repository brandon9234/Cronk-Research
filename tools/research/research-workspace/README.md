# Cronk Research workspace

Source-owned, framework-free front end for the additive research read model. The canonical installer (`scripts/research_workspace_site.py`) publishes `index.html` at the site root and modules/styles under a content-addressed `workspace/<release>/` directory. Do not patch generated copies.

## Responsibilities

- `modules/app.js`: navigation, view rendering, filter/pagination state, dialogs, and local watchlist behavior.
- `modules/core.js`: pure formatting, filtering, calendar counting, date-spaced chart geometry, storage validation. No network or DOM dependencies.
- `modules/data.js`: lazy JSON transport; verifies raw byte length and SHA-256 against the bound manifest before decoding/cache. Mixed snapshots fail closed with reload guidance.
- `modules/dom.js`: DOM creation with text nodes and explicit event handlers; source text never enters HTML markup.
- `modules/charts.js`: SVG history charts plus accessible expandable data tables; missing observations remain absent.
- `styles.css`: responsive layout using verified Cronk theme tokens, keyboard focus and reduced-motion support.

Data schema: `../docs/research-workspace-schema.md`. Bootstrap loads only the manifest. Competitors, moments and profile histories fetch separately on demand. Shop rows use columnar/dictionary transport and are hydrated into the documented read model.

## Semantics to preserve

Supplier sales estimates, review-calibrated models and observed review counts must retain their distinct labels and dates. Wider shop coverage is not the sales-monitored shop count. A new build is not a data refresh. Calendar windows are planning assumptions, not observed demand peaks. Momentum compares adjacent calendar months inside the observed span; completeness of sampled reviews and statistical significance remain unverified.

A watchlist is local to this browser. It is not a server subscription or collection schedule. Browser storage failure must not break navigation.

## Validation

```sh
node --test research-workspace/tests/core.test.mjs
node --check research-workspace/modules/app.js
python3 scripts/research_workspace_site.py
```

Serve the export via localhost or HTTPS (Web Crypto is required for verified shards). Browser checks should cover:

1. Overview dates and sales-monitored versus wider coverage totals.
2. Competitor text/category/evidence-type filters, numeric sorting, next/previous pagination, unknown-value ordering, and no-match state.
3. Watchlist toggle, reload persistence, and watchlist-only filtering.
4. A shop with monthly history and one without it; exact dates and model caveats in the dialog; Escape/close restores focus.
5. Month toggle, group filter, keyword search and load-more; buyer-moment evidence and advanced link.
6. All four views at desktop and 390px width, no page overflow; tables may scroll inside their own containers.
7. Missing bootstrap/shard and same-length modified shard; show actionable errors and never render unverified data.
8. No script errors, source-text injection, or giant legacy asset preload.

The advanced workspace remains linked at `classic.html`; legacy query routing is owned by the site installer. The UI does not fetch live Etsy data or claim a successful collection run.
