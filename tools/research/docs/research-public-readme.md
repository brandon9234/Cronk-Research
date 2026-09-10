# Cronk Research

A research workspace for competing Etsy shops, estimated sales velocity, buyer moments and the evidence behind them.

- **Overview:** compact historical market context with explicit source dates.
- **Competitors:** search, filter, compare estimates, inspect review history and save a browser-local watchlist.
- **Buyer moments:** explore 780 classified occasions across 33 groups and their planning windows.
- **Evidence & health:** inspect source ages, coverage, estimation methods and limitations.
- **Advanced research:** the original detailed listing, company, buyer-moment and operations tools remain at `classic.html`. Existing `?view=` links continue to work.

The current research is historical. A fresh interface build does not refresh supplier snapshots or review collection. Supplier estimates, review-derived models and observed reviews remain separate. Planning windows are hypotheses, not measured purchase peaks.

## Reproducible implementation

The modular read model, frontend source, regression tests and build tools are in [`tools/research`](tools/research). See the [architecture](tools/research/docs/research-architecture.md) and [schema](tools/research/docs/research-workspace-schema.md).

```sh
python3 tools/research/scripts/research_workspace_site.py --export-dir . --verify-only
python3 tools/research/scripts/research_workspace_site.py --export-dir .
python3 -m http.server 8765
```

Use localhost or HTTPS: detail shards are verified against their manifest using Web Crypto. The bootstrap is about 40 KB; catalogs and chart histories load only when needed. No private raw databases or credentials are included.
