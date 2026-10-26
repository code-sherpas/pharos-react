---
'@code-sherpas/pharos-react': major
---

pharos-react now requires `@code-sherpas/pharos-tokens` 0.8 or later (the peer range goes from `^0.4.0` to `^0.8.0`). Upgrade pharos-tokens together with pharos-react: `pnpm add @code-sherpas/pharos-react@^1 @code-sherpas/pharos-tokens@^0.8`.

Nothing changes on screen for an app already on pharos-tokens 0.8. The z-index and colour vars that pharos-react read with a fallback value (`--pharos-z-index-modal`, `-popover`, `-toast`, `--pharos-color-surface-card`, `--pharos-color-border-subtle`) now come from the tokens alone, since every supported version defines them. This range is what lets the next releases use the warm surfaces (`paper-*`, `rule-*`) and the rest of the tokens published since 0.5.
