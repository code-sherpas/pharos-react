---
'@code-sherpas/pharos-react': minor
---

Remove `PharosHello` (seed component used only to validate the publishing
pipeline) and its named exports `PharosHello` and `PharosHelloProps`.
The Phase 2 atom roadmap supersedes it: `Button` is the first real component
and the rest of the atoms follow.

Tagged `minor` rather than `major` because the package is still in 0.x
(per npm convention, breaking changes in 0.x bump minor; reserving the 1.0
jump for an explicit "API now stable" milestone).

Migration: any consumer importing `PharosHello` removes the import. There
are no behavioural replacements — the component never had a production use
case.
