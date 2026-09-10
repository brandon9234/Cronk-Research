#!/usr/bin/env python3
"""Install and verify the modular research workspace over a legacy export.

All data inputs are existing public assets. This command does not run collectors,
refresh raw evidence or write to the marketplace. The classic research interface
and all underlying listing/review assets remain available.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import re
import shutil
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))


def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()


def verify(export):
    research=export/'assets/research'
    manifest=json.loads((research/'manifest.json').read_text())
    if manifest.get('schemaVersion')!=1:raise ValueError('Unsupported workspace schema')
    if (research/'manifest.json').stat().st_size>1_000_000:raise ValueError('Bootstrap budget exceeded')
    objects={'manifest.json':manifest}
    for key,relative in manifest['assets'].items():
        if not re.fullmatch(r'[a-z-]+\.json',relative):raise ValueError('Unsafe workspace asset pointer')
        path=research/relative
        payload=json.loads(path.read_text())
        objects[relative]=payload
        if payload.get('schemaVersion')!=1:raise ValueError('Workspace shard schema mismatch')
        raw=path.read_bytes()
        if b'/Users/' in raw or b'file://' in raw:raise ValueError('Local path in public workspace')
        integrity=manifest.get('assetIntegrity',{}).get(key)
        if not integrity or integrity['sha256']!=sha(path) or integrity['bytes']!=len(raw):
            raise ValueError('Workspace asset integrity mismatch: '+key)
    from cronk_research.workspace import validate_read_model
    validate_read_model(objects)
    if not manifest.get('sourceFiles'):raise ValueError('Source provenance required')
    for source in manifest['sourceFiles']:
        relative=Path(source['asset'])
        if relative.is_absolute() or '..' in relative.parts:raise ValueError('Unsafe source provenance path')
        path=export/'assets'/relative
        if not path.is_file() or sha(path)!=source['sha256'] or path.stat().st_size!=source['bytes']:
            raise ValueError('Research projection is stale relative to source asset: '+str(relative))
    html=(export/'index.html').read_text()
    if 'data-research-workspace="1"' not in html:raise ValueError('New workspace entrypoint missing')
    for relative in re.findall(r'(?:src|href)="(workspace/[^"?]+)',html):
        if '..' in Path(relative).parts or not (export/relative).is_file():raise ValueError('Workspace module asset missing')
    if not (export/'classic.html').is_file():raise ValueError('Advanced research entrypoint missing')
    for name in ('app.js','styles.css','data.json'):
        if not (export/'assets'/name).is_file():raise ValueError('Advanced research dependency missing')
    return {'ok':True,'schemaVersion':1,'snapshotId':manifest.get('snapshotId'),
            'counts':manifest['counts'],'bootstrapBytes':(research/'manifest.json').stat().st_size}


def install(export:Path,*,rebuild_data=True,include_source=True):
    export=export.resolve()
    if rebuild_data:
        from cronk_research.workspace import build
        build(export/'assets')
    frontend=ROOT/'research-workspace'
    sources=[p for p in sorted(frontend.rglob('*')) if p.is_file() and p.suffix in ('.js','.css') and 'tests' not in p.relative_to(frontend).parts]
    if not sources or not (frontend/'styles.css').is_file():raise ValueError('Complete frontend source required')
    release=hashlib.sha256(''.join(str(p.relative_to(frontend))+sha(p) for p in sources).encode()).hexdigest()[:16]
    target=export/'workspace'/release
    for source in sources:
        destination=target/source.relative_to(frontend);destination.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,destination)
    html=(frontend/'index.html').read_text().replace('<html lang="en">','<html lang="en" data-research-workspace="1">')
    html=html.replace('"assets/workspace/','"workspace/'+release+'/').replace('"workspace/styles.css','"workspace/'+release+'/styles.css').replace('"workspace/modules/','"workspace/'+release+'/modules/')
    # Preserve existing share links to advanced views. New workspace navigation
    # uses #overview/#competitors/#moments/#evidence; old ?view= links stay exact.
    redirect="""<script>const legacyView=new URLSearchParams(location.search).get('view');if(legacyView){location.replace('classic.html'+location.search+location.hash);}</script>"""
    html=html.replace('</head>',redirect+'</head>')
    classic_path=export/'classic.html'
    original=classic_path if classic_path.exists() else export/'index.html'
    classic=original.read_text() if original.exists() else ''
    if 'data-research-workspace="1"' in classic or not classic:
        classic=(ROOT/'legacy-dashboard/index.html').read_text()
    if 'id="workspace-return"' not in classic:
        classic=classic.replace('<body>','<body><div id="workspace-return" style="padding:12px 24px;background:#17231d;color:white"><a href="./" style="color:white">← Research workspace</a> · Advanced research · Historical source dates and estimate caveats still apply.</div>')
    for name in ('app.js','styles.css'):
        classic=re.sub(r'assets/'+re.escape(name)+r'\?v=[^"\s]+','assets/'+name+'?v='+sha(export/'assets'/name)[:16],classic)
    classic_path.write_text(classic)
    (export/'index.html').write_text(html)
    readme=ROOT/'docs/research-public-readme.md'
    if readme.exists():shutil.copy2(readme,export/'README.md')
    if include_source:
        # Public-safe source for reproducible builds. No raw stores/configuration
        # or old private ingestion scripts are copied into the public repository.
        root=export/'tools/research'
        paths=['cronk_research','research-workspace','legacy-dashboard','tests','scripts/build_research_workspace.py',
               'scripts/research_workspace_site.py','scripts/research_workspace_store.py',
               'scripts/test_research_workspace_store.py','scripts/verify_research_browser.mjs',
               'docs/research-workspace-schema.md','docs/research-architecture.md','docs/research-public-readme.md']
        for relative in paths:
            source=ROOT/relative;dest=root/relative
            if not source.exists():continue
            if source.is_dir():
                shutil.copytree(source,dest,dirs_exist_ok=True,ignore=shutil.ignore_patterns('__pycache__','*.pyc'))
            else:
                dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,dest)
        workflow=ROOT/'.github/workflows/research-checks.yml'
        if workflow.exists():
            destination=export/'.github/workflows/research-checks.yml';destination.parent.mkdir(parents=True,exist_ok=True)
            shutil.copy2(workflow,destination)
    result=verify(export)
    result['frontendRelease']=release
    return result


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--export-dir',type=Path,default=ROOT/'github-pages-export')
    parser.add_argument('--verify-only',action='store_true')
    parser.add_argument('--no-rebuild-data',action='store_true')
    args=parser.parse_args()
    print(json.dumps(verify(args.export_dir) if args.verify_only else install(args.export_dir,rebuild_data=not args.no_rebuild_data),indent=2))
