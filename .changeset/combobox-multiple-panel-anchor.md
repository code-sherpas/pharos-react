---
'@code-sherpas/pharos-react': patch
---

fix(Combobox): anchor the multi-select popup to the chips control box, not the input

In a `Combobox multiple`, Base UI resolves the popup anchor as
`inputGroupElement ?? inputElement`. Single-select wraps Base UI's `InputGroup`
(`ComboboxControl`), so the popup anchored to the full-width control. But
multi-select uses `Combobox.Chips` (`ComboboxChips`) as the bordered box, and
`Chips` registers no `inputGroupElement` — so the anchor fell back to the
`Input`, which floats at the end of the chip row. Once several chips pushed the
input toward the right edge, the popup opened **narrow and shifted right**
(anchored at the typing caret) instead of keeping the control width.

`ComboboxChips` now publishes its DOM node through an internal context that
`ComboboxContent` reads and passes as the `Positioner`'s `anchor`, so the popup
keeps a **constant width = the control** (`width: var(--anchor-width)`),
left-aligned, regardless of where the input sits. Single-select is unchanged:
no chips box means no anchor override, so Base UI keeps anchoring to the
`ComboboxControl` as before.

No public TypeScript API change. Surfaced in Alexandria's `AddUsers` /
`AddSkills` multi-select pickers.
