---
'@code-sherpas/pharos-react': patch
---

A disabled Combobox now looks disabled. Its whole control (the single-select box and the multi-select chips box) drops to the 0.5 opacity Input and the Select trigger use, and the chevron, the clear button and a chip's remove button show the `not-allowed` cursor. Until now only the text field had `cursor: not-allowed`, so a disabled Combobox read as editable next to disabled fields that were greyed out.
