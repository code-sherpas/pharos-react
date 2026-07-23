// Regression guard for the per-component RSC build (#80).
//
// Asserts, against the built `dist/`, that:
//   1. Every CLIENT atom's chunk starts with the `"use client"` directive
//      (so a React Server Component consumer gets a proper client boundary and
//      Next.js RSC build-time analysis does not evaluate hook/context code).
//   2. Every STATELESS atom's chunk ships WITHOUT the directive (so it stays
//      importable from a Server Component).
//   3. The barrel (`dist/index.js`) is NOT blanket-`"use client"` (the whole
//      point of #80: importing a stateless atom must not drag in a client
//      boundary).
//   4. `dist/styles.css` is a single bundle that still carries the full set of
//      component classes (guards the CSS-bundle regression that would silently
//      break `import '@code-sherpas/pharos-react/styles.css'`).
//
// Runs in `pnpm build` (after `verify:dist-types`) and in CI, so a directive
// or CSS-bundle regression cannot ship. The client/stateless split is the
// source of truth — keep it in sync when adding an atom.

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = (p) => resolve(root, 'dist', p);

// Atoms that use React hooks / context / a Base UI primitive → client-only.
const CLIENT = [
  'Avatar',
  'Button',
  'IconButton',
  'Checkbox',
  'Combobox',
  'Dialog',
  'DropdownMenu',
  'Popover',
  'RadioGroup',
  'Select',
  'Sheet',
  'Switch',
];

// Presentational atoms with no hooks → server-renderable, no directive.
const STATELESS = ['Badge', 'Card', 'Input', 'Separator', 'Textarea', 'Spinner'];

const DIRECTIVE = /^\s*["']use client["'];/;
const errors = [];

function firstLine(file) {
  return readFileSync(file, 'utf8').split('\n', 1)[0] ?? '';
}

for (const name of CLIENT) {
  const file = dist(`components/${name}.js`);
  if (!existsSync(file)) {
    errors.push(`MISSING: dist/components/${name}.js (client atom chunk not emitted)`);
    continue;
  }
  if (!DIRECTIVE.test(firstLine(file))) {
    errors.push(`NO DIRECTIVE: dist/components/${name}.js must start with "use client"`);
  }
}

for (const name of STATELESS) {
  const file = dist(`components/${name}.js`);
  if (!existsSync(file)) {
    errors.push(`MISSING: dist/components/${name}.js (stateless atom chunk not emitted)`);
    continue;
  }
  const contents = readFileSync(file, 'utf8');
  if (/["']use client["'];/.test(contents)) {
    errors.push(
      `UNEXPECTED DIRECTIVE: dist/components/${name}.js is stateless and must NOT be "use client"`,
    );
  }
}

// The barrel must not be blanket client-only.
const barrel = dist('index.js');
if (!existsSync(barrel)) {
  errors.push('MISSING: dist/index.js');
} else if (DIRECTIVE.test(firstLine(barrel))) {
  errors.push('UNEXPECTED DIRECTIVE: dist/index.js must not be blanket "use client"');
}

// Single CSS bundle still carries the component classes.
const cssPath = dist('styles.css');
if (!existsSync(cssPath)) {
  errors.push('MISSING: dist/styles.css (single CSS bundle)');
} else {
  const css = readFileSync(cssPath, 'utf8');
  // Hashed CSS-module local names look like `_button_a3f2_12`. Count distinct
  // local names; the catalogue produces ~60+, so a collapse well below that
  // means components dropped out of the bundle.
  const locals = new Set(
    [...css.matchAll(/_([a-zA-Z][a-zA-Z0-9]*)_[a-z0-9]+_\d+/g)].map((m) => m[1]),
  );
  const MIN = 40;
  if (locals.size < MIN) {
    errors.push(
      `CSS SHRUNK: dist/styles.css has ${locals.size} distinct classes (< ${MIN}); components may have dropped out of the single bundle`,
    );
  }
}

if (errors.length > 0) {
  console.error('verify:dist-rsc FAILED:\n' + errors.map((e) => `  ✗ ${e}`).join('\n'));
  process.exit(1);
}

console.log(
  `verify:dist-rsc OK — ${CLIENT.length} client chunks with "use client", ${STATELESS.length} stateless without, barrel clean, styles.css bundled.`,
);
