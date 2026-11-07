---
'@code-sherpas/pharos-react': minor
---

Add `AlertDialog`, the confirmation atom (shadcn contract over Base UI's AlertDialog): `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogAction` and `AlertDialogCancel`, also at the `@code-sherpas/pharos-react/AlertDialog` subpath. It is a modal `role="alertdialog"` named by its title and described by its description; focus starts on `AlertDialogCancel` (`initialFocus` on `AlertDialogContent` moves it); a click outside does nothing; Escape and Cancel close and reach `onOpenChange(false)`; `AlertDialogAction` confirms and closes. Action and Cancel are Buttons and accept `intent` and `size` (Action defaults to `primary`, Cancel to `secondary`; use `intent="destructive"` on the action for a deletion). Same look as `Dialog`, no new tokens.
