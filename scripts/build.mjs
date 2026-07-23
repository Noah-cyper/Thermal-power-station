#!/usr/bin/env node
/* =====================================================================
   THERMOSCADA — build the self-contained single-file bundle.
   Reads the modular shell (index.html) + assets/*, inlines every CSS
   <link> into one <style> and every JS <script src> into one <script>,
   and writes dist/thermal-power-station/index.html (what Cloudflare serves).

   The app is plain IIFE code (no ES modules), so bundling is a faithful,
   ordered concatenation — no transpiler needed.

   Usage:  node scripts/build.mjs
   ===================================================================== */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'dist/thermal-power-station/index.html');
const read = (p) => readFileSync(join(root, p), 'utf8');

let html = read('index.html');

// 1) Inline CSS: replace the run of stylesheet <link>s with one <style>.
const cssHrefs = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"\s*\/>/g)].map((m) => m[1]);
if (!cssHrefs.length) throw new Error('No stylesheet links found in index.html');
const cssInline = cssHrefs.map(read).join('\n');
let cssDone = false;
html = html.replace(/[ \t]*<link rel="stylesheet" href="[^"]+"\s*\/>\n?/g, () => {
  if (cssDone) return '';
  cssDone = true;
  return '  <style>\n' + cssInline + '\n  </style>\n';
});

// 2) Inline JS: replace the run of <script src> tags with one <script>.
const jsSrcs = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
if (!jsSrcs.length) throw new Error('No script tags found in index.html');
for (const s of jsSrcs) if (read(s).includes('</script>')) throw new Error('Unexpected </script> literal in ' + s);
const jsInline = jsSrcs.map(read).join('\n');
let jsDone = false;
html = html.replace(/[ \t]*<script src="[^"]+"><\/script>\n?/g, () => {
  if (jsDone) return '';
  jsDone = true;
  return '  <script>\n' + jsInline + '\n  </script>\n';
});

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);
console.log(`Built ${OUT}\n  ${cssHrefs.length} css + ${jsSrcs.length} js inlined · ${html.length} bytes`);
