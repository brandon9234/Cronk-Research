#!/usr/bin/env python3
"""Build the normalized public research workspace; no network or source writes."""
import argparse
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from cronk_research.workspace import build

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--asset-dir', type=Path, default=ROOT / 'github-pages-export' / 'assets')
    parser.add_argument('--output-dir', type=Path)
    parser.add_argument('--built-at', help='Explicit artifact timestamp for reproducible builds; does not change source dates')
    args = parser.parse_args()
    print(json.dumps(build(args.asset_dir, args.output_dir, built_at=args.built_at), indent=2))
