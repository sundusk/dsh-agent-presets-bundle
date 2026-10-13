#!/usr/bin/env python3
"""Build the local install tarball from package.json's explicit file list."""
import hashlib
import json
from pathlib import Path
import tarfile

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'package.json').read_text())
paths = [root / 'package.json'] + [root / name for name in manifest['files']]
for path in paths:
    assert path.exists() and path.resolve().is_relative_to(root), f'Invalid package file: {path}'
    members = [path] + (list(path.rglob('*')) if path.is_dir() else [])
    assert not any(p.is_symlink() for p in members), f'Symlinks are not portable: {path}'
for patch in manifest['dsh']['bundle']['patch']:
    path = root / patch
    assert path.is_file() and path.resolve().is_relative_to(root), f'Missing patch: {patch}'

dist = root / 'dist'
dist.mkdir(exist_ok=True)
name = manifest['name'].lstrip('@').replace('/', '-')
archive = dist / f"{name}-{manifest['version']}.tgz"
with tarfile.open(archive, 'w:gz') as tar:
    for path in paths:
        tar.add(path, arcname='package/' + path.relative_to(root).as_posix(),
                filter=lambda item: None if Path(item.name).name in ('.DS_Store', '__pycache__') else item)
with tarfile.open(archive) as tar:
    names = set(tar.getnames())
    assert 'package/package.json' in names
    assert all('package/' + p.removeprefix('./') in names for p in manifest['dsh']['bundle']['patch'])
print(archive)
print('SHA256:', hashlib.sha256(archive.read_bytes()).hexdigest())
