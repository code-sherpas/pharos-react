---
'@code-sherpas/pharos-react': minor
---

Add the `DropdownMenu` compound atom (Decision D15).

An action menu anchored to a trigger, wrapping Base UI's `Menu.*` parts,
which implement the ARIA APG **menu-button** pattern (`role="menu"` /
`menuitem`, roving focus, arrow-key navigation, typeahead, and
Escape-to-close with focus return to the trigger).

Naming follows shadcn rather than Base UI's `Menu`. The surface collapses
Base UI's `Portal` + `Positioner` + `Popup` into a single
`DropdownMenuContent` exposing `side` / `align` / `sideOffset`. Parts
shipped in v1: `DropdownMenu`, `DropdownMenuTrigger`,
`DropdownMenuContent`, `DropdownMenuItem` (with a `destructive` variant),
`DropdownMenuSeparator`, `DropdownMenuLabel`, `DropdownMenuGroup`.

Deliberately distinct from a future `Popover` atom: a DropdownMenu is for
commands (menu-button contract); free-form anchored content belongs in a
Popover (disclosure/dialog contract). 7 of 8 surveyed top-tier design
systems separate the two. `CheckboxItem`, `RadioItem`, submenus and
`LinkItem` are deferred — no consumer exercises them yet and the compound
API makes them additive without a breaking change.
