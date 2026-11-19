---
'@code-sherpas/pharos-react': minor
---

Add `Alert`, an inline notice for something the person has to read inside a page, a form or a dialog, which stays for as long as it is true: `Alert`, `AlertTitle` and `AlertDescription`, also at the `@code-sherpas/pharos-react/Alert` subpath. Not a `Toast` (it does not go away on its own and has no close button) and not a `Dialog` (it does not interrupt).

`variant` is `default`, `info`, `success`, `warning` or `destructive`, the values of `Toast` and `Badge`, mirrored on `data-pharos-variant`. Every variant but `default` carries the same icon as `Toast`, and each has a side bar of its tone on the inline-start edge, so the tone never rests on colour alone; the text keeps the normal text colour. The `warning` bar and the fill of its triangle use `semantic.warning.border` from `@code-sherpas/pharos-tokens` 1.3.0 (3.69:1 on the card), so the icon that tells a warning from a note reaches 3:1 too.

`warning` and `destructive` are `role="alert"`; `default`, `info` and `success` are `role="status"`. An `Alert` mounted after the page has loaded renders everything at once, at its final size, but keeps its content `visibility: hidden` for two frames and then shows it, so screen readers announce it as text arriving in a live region they already know; during those two frames nothing inside it can take focus. One rendered on the server is shown at once, found by reading the page, and hydrates without a change. New text in an `Alert` on screen is announced in the same region; changing `variant` from a `status` tone to an `alert` one (or back) mounts it anew, children included, and announces it with the new urgency.

Pharos puts no text in it. `AlertTitle` is a `div`; `render={<h3 />}` (or any level) makes it the heading its place needs. An action, such as a `Button`, goes after `AlertDescription`.
