---
'@code-sherpas/pharos-react': minor
---

Add `AlertAction` (shadcn's name), the part of `Alert` that holds what the person can do about it, such as «Retry»: one or more Pharos `Button`s after `AlertDescription`, in a row that wraps, under the text and in reading and focus order (not in a corner). It is a `div` marked `data-pharos-slot="alert-action"`, with its `AlertActionProps` type, from the barrel and from the `@code-sherpas/pharos-react/Alert` subpath. A bare `Button` after the description keeps working as before.

To tell the person that a retry failed again, keep the same `Alert` on screen and change its text (for example, how many attempts failed): the change is seen, and announced in the same live region, and the focused button keeps the focus. Remounting the alert would announce it too, but would lose the focus with the button. Say a retry in progress outside the alert, in a polite status, so only the failure interrupts.
