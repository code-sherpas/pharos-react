---
'@code-sherpas/pharos-react': patch
---

Dialog and Sheet move to the modal layer of the z-index scale (decision D29). Their backdrop and panel now use `--pharos-z-index-modal` (fallback 1400) instead of `--pharos-z-index-popover`, so a modal opened over another one covers it, backdrop included. The positioners of Select, Combobox, Popover and DropdownMenu keep `--pharos-z-index-popover`, with its fallback raised from 1000 to 1500, so a list opened from inside a Dialog or Sheet still paints above it. An app on pharos-tokens 0.6 or later gets these values from the tokens; an older one gets them from the fallbacks.
