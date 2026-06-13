---
'@code-sherpas/pharos-react': minor
---

Add the `Popover` compound atom (Decision D16).

Free-form content anchored to a trigger, wrapping Base UI's `Popover.*`
parts, which implement the ARIA **dialog** pattern as a **non-modal**
disclosure: `role="dialog"` on the popup, focus moves into it on open and
returns to the trigger on close, Escape and outside-click dismiss it, and
focus is NOT trapped (the rest of the page stays interactive).

Naming follows shadcn rather than Base UI's `Popover` parts. The surface
collapses Base UI's `Portal` + `Positioner` + `Popup` into a single
`PopoverContent` exposing `side` / `align` / `sideOffset` / `alignOffset`
(`align` defaults to `center`, unlike DropdownMenu's `start`). Parts shipped
in v1: `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverTitle`,
`PopoverDescription`, `PopoverClose`.

Deliberately distinct from the `DropdownMenu` atom (D15): a DropdownMenu is
for commands (menu-button contract — `role="menu"`/`menuitem`, roving
focus); a Popover holds arbitrary content (forms, navigation, panels) under
the disclosure/dialog contract. The two wrap different Base UI primitives
(`Menu` vs `Popover`) and share no machinery — 7 of 8 surveyed top-tier
design systems separate them. `PopoverArrow`, a non-trigger `PopoverAnchor`
(the future Combobox will want it) and a modal `Backdrop` are deferred — no
consumer exercises them yet and the compound API makes them additive without
a breaking change.
