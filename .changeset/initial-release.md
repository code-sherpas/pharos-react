---
'@code-sherpas/pharos-react': minor
---

Initial release — scaffolded React component library consuming
`@code-sherpas/pharos-tokens` via `@theme inline`.

Ships a single demo component (`PharosHello`), the `cn` helper on top of
`clsx` + `tailwind-merge`, and the compiled stylesheet at
`@code-sherpas/pharos-react/styles.css`. Intended as a baseline so
downstream consumers (`alexandria-design`, `alexandria-web-application`)
can start integrating the import path and peer-dependency chain before
real components land in Phase 2.
