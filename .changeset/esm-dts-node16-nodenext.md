---
'@code-sherpas/pharos-react': patch
---

Fix the published types for TypeScript consumers with `module`/`moduleResolution` `node16` or `nodenext`. Since 0.2.2 the `.d.ts` files imported each other without a file extension (`'./components/Button'`), which ESM resolution rejects: with `skipLibCheck: false` such a consumer got 48 TS2835 errors in `dist/index.d.ts` and `dist/components/AlertDialog.d.ts`, and with `skipLibCheck: true` it compiled while everything from the barrel (and `ButtonProps` inside the `AlertDialog` subpath) was typed as `any`. Every relative import now carries `.js`, and the package's own checks compile the packed tarball in `bundler`, `node16` and `nodenext`. Bundler consumers see no change, and the runtime JavaScript and CSS are byte-for-byte the same.

**Heads-up for node16/nodenext consumers with `skipLibCheck: true`:** the components stop arriving as `any` and get their real types, so type errors in your own code that `any` was hiding (a wrong prop, a missing required one) can now appear. They are real errors in the calling code, not a change of contract.
