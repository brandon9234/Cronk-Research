# eRank Market Dashboard

Static GitHub Pages snapshot generated from the cached eRank workbook plus the local SQLite market warehouse.

Regenerate from the parent project with the static snapshot builder:

```bash
python scripts/build_github_pages_snapshot.py
```

Then add the SQL-backed MyMaravia opportunity layer:

```bash
python scripts/build_sql_opportunity_snapshot.py
```

For the frequent SQL-only refresh after review/eRank imports:

```bash
scripts/refresh_github_pages_opportunity.sh
```

The second step reads the current eRank SQLite database and MyMaravia Etsy API snapshot, then rewrites `github-pages-export/assets/data.json` with the Opportunity tab data. GitHub Pages stays static; the SQLite database remains local/private.
