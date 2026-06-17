---
'@code-sherpas/pharos-react': patch
---

fix(Select): anchor the listbox below the trigger instead of overlapping it

`SelectContent` now forces Base UI's `alignItemWithTrigger` to `false`. Base UI's
`Select.Positioner` defaults it to `true` — the native-`<select>` / macOS
behaviour that floats the popup _over_ the trigger and, as a side effect,
silently ignores the `side` / `align` / `sideOffset` props (it forces
`renderedSide = 'none'`). The listbox therefore covered the trigger box, and the
documented "opens below the trigger, 8px away" defaults never applied.

With `alignItemWithTrigger={false}` the listbox opens **below the trigger** with
the 8px `sideOffset`, matching the dominant web convention (shadcn
`position="popper"`, Ant, Mantine) and — decisively — making `Select` consistent
with `Combobox`, whose Base UI primitive has no item-alignment mode and always
anchors adjacent. No public API change. D17 refinement; see NAMING-decisions § Select + Combobox.

Also fixes a pre-existing critical a11y issue surfaced by the same change:
`SelectSeparator` re-exported Base UI's generic `Separator` (`role="separator"`),
which is not a permitted child of the `listbox` role and failed axe's
`aria-required-children` on a grouped Select. It now renders decoratively
(`aria-hidden`, `role="none"`) — the grouping semantics already live on
`SelectGroup` / `SelectLabel`, matching Radix / shadcn.
