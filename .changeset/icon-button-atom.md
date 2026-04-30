---
'@code-sherpas/pharos-react': minor
---

Add `IconButton` atom — icon-only pressable control. Dedicated atom rather than a `<Button size="icon">` variant (Decision D13, 2026-04-30): six of eight top-tier DSes ship a dedicated `IconButton` (Material 3, MUI, Chakra, Radix Themes, IBM Carbon, plus Mantine's `ActionIcon`), and a dedicated atom enforces `aria-label` (or `aria-labelledby`) at the **type level** instead of leaving WCAG 4.1.2 compliance as a runtime warning the way Chakra / Mantine do.

Public API mirrors Button: `intent="primary | secondary | ghost | destructive"` × `size="sm | md | lg"` × native `<button>` props × Base UI `render` prop for composition (`<IconButton render={<Link to="/next" />} aria-label="Next">`). Defaults: `intent="ghost"` (the dominant icon-only case is low-emphasis — close, dismiss, toolbar action), `size="md"`. Square dimensions matching the Button height grid (32 / 40 / 48 px); `border-radius: var(--pharos-radius-full)` produces a perfect circle. Direct-child `> svg` selector sizes Lucide icons (which ship with hardcoded `width="24" height="24"`) to 16 / 20 / 24 px to match the icon slot.

`isLoading` prop wired into the atom because the icon-only case is materially worse without it: with a Button the consumer can compose `<Button disabled><Spinner /><span>Saving</span></Button>`, but with an IconButton the slot has to be **swapped** (icon while idle, Spinner while loading), forcing two render branches at every async call-site. Setting `isLoading` swaps the slot for `<Spinner size={size}/>`, sets `disabled`, and exposes `aria-busy="true"`.

No integrated Tooltip (diverges from IBM Carbon's mandatory tooltip): `aria-label` already satisfies WCAG 4.1.2; tooltip is a separate composition concern and a separate atom (not yet shipped). No `selected` toggle state in v1: no Alexandria call-site exercises the toggle pattern today; additive when needed.

Adoption contract documented in `NAMING-decisions.md` — the release pairs with an Alexandria PR that replaces `CloseButton`, `CloseButtonCircle`, `NextCircleButton`, `PreviousCircleButton` with the corresponding `<IconButton>` mappings, and folds the icon-only call-sites of `AsyncLoadingButton` / `PublishButton` / `UnpublishButton` / `AddButton` into the atom's built-in `isLoading`.
