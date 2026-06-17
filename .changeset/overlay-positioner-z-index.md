---
'@code-sherpas/pharos-react': patch
---

fix(overlays): give the anchored popups a configurable z-index so they clear host-app overlays

`Combobox`, `Select`, `DropdownMenu` and `Popover` portal their popup to the end
of `<body>`, which floats it above in-flow content — but **not** above a
host-app overlay that carries its own `z-index` (a drawer, a modal). Worse, a
`z-index` set on the popup surface (`*Content`) is inert: Base UI's `Positioner`
anchors with `transform`, which creates a stacking context that traps any
`z-index` on its descendants. So a consumer could not lift the popup from the
outside at all.

The `z-index` now lives on the **Positioner** (where it is not trapped), sourced
from `var(--pharos-z-index-popover, 1000)`. Apps with no high z-index scale get
a sensible default; an app whose own overlays sit higher (e.g. a drawer at
`z-index: 10000`) raises **every** Pharos popup at once by overriding
`--pharos-z-index-popover` in `:root` — no per-call-site className. This closes
the long-standing "shared `--pharos-z-index-*` scale" follow-up the four
overlay modules carried.

No public TypeScript API change. Surfaced while adopting the `Combobox`-multiple
pickers in Alexandria, whose `AddSkills` picker lives inside a `z-index: 9999`
drawer and had its listbox rendering behind the drawer.
