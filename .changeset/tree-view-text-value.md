---
'@code-sherpas/pharos-react': minor
---

`TreeViewItem` takes an optional `textValue`: the text typing is matched against when the label starts with something that is not the name, such as a level badge. Typing then moves by names, not by levels, and the label stays the accessible name (WCAG 2.5.3). Without it, typing matches the label's text, as before.

The TreeView documentation now says why axe's `label-content-name-mismatch` flags open branches and items with a description, why that is a false positive, and the selector that keeps the rule running on everything else.
