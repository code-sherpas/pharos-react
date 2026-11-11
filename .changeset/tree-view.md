---
'@code-sherpas/pharos-react': minor
'@examples/saas-demo': patch
---

Add `TreeView` (ARIA APG Tree View): show a hierarchy, open and close its branches, walk it with the keyboard and a screen reader, and choose an item. Parts: `TreeView`, `TreeViewItem`, `TreeViewItemLabel`, `TreeViewItemDescription`, `TreeViewGroup`; deep import `@code-sherpas/pharos-react/TreeView`.

- Open branches (`expanded` / `defaultExpanded` / `onExpandedChange`) and the chosen item (`value` / `defaultValue` / `onValueChange`, `aria-selected`), each controlled or not. Choosing does not follow focus; `onValueChange` is called on every choice, also of the item already chosen.
- Keyboard: ↓ ↑, → ← (mirrored right to left), Home, End, Enter and Space choose, `*` opens the sibling branches, typeahead ignoring case and accents. One tab stop: the chosen item, else the one focused last, else the first.
- `disabled` items (`aria-disabled`) stay visible, focusable and openable but cannot be chosen; `TreeViewItemDescription` says why.
- Names wrap, never truncated, so a five-level tree reads at 320px and at 200% zoom. No new tokens.
