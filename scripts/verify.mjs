import assert from 'node:assert/strict';
import { readFileSync, existsSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Use the official built parser instead of maintaining a second YAML dialect.
const root = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const harness = resolve(process.argv[2] ?? '../DeepseekHarness/deepseek-harness');
const { loadOverlayPatches, bundlePatchPaths } = await import(pathToFileURL(join(harness, 'packages/boot/app-boot/lib/index.js')));
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const paths = bundlePatchPaths(root, manifest.dsh.bundle);
const entries = paths.flatMap(path => loadOverlayPatches('preset-verify', path)).flatMap(patch => patch.insert ?? []);
const presets = entries.filter(entry => entry.name === '@deepseek-ai/dsh-agent-preset');
assert.deepEqual(presets.map(entry => entry.config.id), ['codex', 'deveco', 'ios-senior', 'novel', 'rea']);
assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length);
assert.equal(entries.filter(entry => entry.id === 'subagent-codex').length, 1);
for (const path of paths) assert.ok(!readFileSync(path, 'utf8').includes('/Users/sundusk/'));

let skillRoots = 0;
function visit(rows) {
  for (const row of rows) {
    for (const expression of row.config?.customSkillDirs ?? []) {
      const folder = new Function('baseUrl', `return (${expression.__jsExpr});`)(pathToFileURL(join(root, 'package.json')));
      assert.ok(folder.startsWith(root + '/') && existsSync(folder));
      skillRoots++;
    }
    if (Array.isArray(row.config)) visit(row.config);
    if (Array.isArray(row.config?.plugins)) visit(row.config.plugins);
  }
}
visit(presets);
assert.equal(skillRoots, 2);
for (const path of ['skills/ios-senior/ios-development-rules/SKILL.md', 'skills/rea/rea-cli/SKILL.md']) assert.ok(existsSync(join(root, path)));
console.log('PASS: official parser, five unique presets, one Codex provider, portable skill paths and bundled rules.');
