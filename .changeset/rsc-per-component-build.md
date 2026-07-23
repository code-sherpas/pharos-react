---
'@code-sherpas/pharos-react': minor
---

Per-component RSC granularity (#80). The library now ships one file per atom
(`dist/components/Button.js`, …) via a `preserveModules` build, and each atom
that uses React hooks / context / a Base UI primitive carries its own per-file
`"use client"` directive (Avatar, Button, IconButton, Checkbox, Combobox,
Dialog, DropdownMenu, Popover, RadioGroup, Select, Sheet, Switch). Stateless
atoms (`Badge`, `Card`, `Input`, `Separator`, `Textarea`, `Spinner`) ship
**without** the directive, so they are now importable from React Server
Components. Replaces the old blanket `"use client"` bundle banner.

Additive, non-breaking:

- The named barrel API is unchanged — `import { Card } from '@code-sherpas/pharos-react'` and the single `@code-sherpas/pharos-react/styles.css` import work exactly as before.
- New deep-import subpaths per component (`import { Card } from '@code-sherpas/pharos-react/Card'`) allow finer tree-shaking.
- `class-variance-authority` and `clsx` are now bundler-external (they are already runtime `dependencies`, installed transitively), so the multi-entry output ships bare specifiers instead of an inlined copy.

Consumers that only use stateless atoms no longer pull the whole library
client-side, and bundles shrink to the atoms actually imported.
