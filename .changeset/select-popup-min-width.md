---
'@code-sherpas/pharos-react': patch
---

The `Select` list is now at least as wide as its trigger and grows with its options, up to the width available on screen, instead of measuring exactly the trigger's width. A narrow trigger, such as a filter pill as wide as its value, no longer breaks short options like «Any date» onto two lines. A form `Select`, whose trigger fills the field, looks the same unless an option is wider than the field: its list now widens to fit it. Only an option wider than the screen allows still wraps. `Combobox` is unchanged.
