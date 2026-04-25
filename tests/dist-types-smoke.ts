// Regression guard for the empty-barrel bug fixed in fix/dts-rollup-empty.
// vite-plugin-dts with `rollupTypes: true` previously shipped
// `dist/index.d.ts` as a 12-byte `export {}`, so consumers got
// "Module has no exported member 'Button'" at typecheck time even though
// the runtime JS exported everything correctly. The bug was silent
// because `pnpm typecheck` only checks `src/`, not the built artifact.
//
// This file imports each public export from the built `dist/index.js`
// (resolved alongside `dist/index.d.ts`). Any release that fails to
// expose `Button`, `buttonVariants`, `PharosHello`, `cn` or their types
// makes `pnpm verify:dist-types` fail. The check runs in
// `prepublishOnly` and as a CI step, so a regression cannot ship.

import {
  Button,
  buttonVariants,
  PharosHello,
  cn,
  type ButtonProps,
  type PharosHelloProps,
} from '../dist/index.js';

const _button: typeof Button = Button;
const _buttonVariants: typeof buttonVariants = buttonVariants;
const _hello: typeof PharosHello = PharosHello;
const _cn: typeof cn = cn;
const _buttonProps: ButtonProps = { intent: 'primary', size: 'md' };
const _helloProps: PharosHelloProps = { name: 'smoke' };

// Touch the bindings so the file is not flagged as unused.
export const _smoke = [_button, _buttonVariants, _hello, _cn, _buttonProps, _helloProps];
