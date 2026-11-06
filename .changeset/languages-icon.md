---
'@code-sherpas/pharos-react': minor
---

Adds `LanguagesIcon`, the first public icon: Lucide's `languages` drawing as an inline SVG, from the barrel or from `@code-sherpas/pharos-react/LanguagesIcon`. It renders in a Server Component and does not need `lucide-react`. It is `1em` in size and uses `currentColor`, so it follows the surrounding text. It is `aria-hidden` by default, because it usually sits next to text or inside a control that already has a name, such as `IconButton`; pass `label` when it stands alone and it becomes `role="img"` with that accessible name. Carries `data-pharos-icon="languages"`.

The package now ships `THIRD-PARTY-NOTICES.md` with Lucide's licence. It also covers the Lucide paths that `Select` and `Checkbox` already inlined, which until now shipped without the notice.
