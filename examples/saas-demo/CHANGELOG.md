# @examples/saas-demo

## 0.0.30

### Patch Changes

- Updated dependencies [671e3e0]
  - @code-sherpas/pharos-react@3.2.0

## 0.0.29

### Patch Changes

- 8073aab: Dialog, AlertDialog and Sheet: the footer's actions wrap onto further rows when they do not fit side by side (320px, 200% zoom, labels that say what they do), still at the end and in DOM order, instead of running off the edge (WCAG 1.4.10). Button: a label wider than its whole container wraps between words inside a Button that is never wider than the container; heights become minimums (one line keeps 32 / 40 / 48). In a row a Button still does not shrink. No API change.
- Updated dependencies [8073aab]
  - @code-sherpas/pharos-react@3.1.1

## 0.0.28

### Patch Changes

- da52021: Add `TreeView` (ARIA APG Tree View): show a hierarchy, open and close its branches, walk it with the keyboard and a screen reader, and choose an item. Parts: `TreeView`, `TreeViewItem`, `TreeViewItemLabel`, `TreeViewItemDescription`, `TreeViewGroup`; deep import `@code-sherpas/pharos-react/TreeView`.

  - Open branches (`expanded` / `defaultExpanded` / `onExpandedChange`) and the chosen item (`value` / `defaultValue` / `onValueChange`, `aria-selected`), each controlled or not. Choosing does not follow focus; `onValueChange` is called on every choice, also of the item already chosen.
  - Keyboard: ↓ ↑, → ← (mirrored right to left), Home, End, Enter and Space choose, `*` opens the sibling branches, typeahead ignoring case and accents. One tab stop: the chosen item, else the one focused last, else the first.
  - `disabled` items (`aria-disabled`) stay visible, focusable and openable but cannot be chosen; `TreeViewItemDescription` says why.
  - Names wrap, never truncated, so a five-level tree reads at 320px and at 200% zoom. No new tokens.

- Updated dependencies [da52021]
  - @code-sherpas/pharos-react@3.1.0

## 0.0.27

### Patch Changes

- Updated dependencies [6839aff]
  - @code-sherpas/pharos-react@3.0.2

## 0.0.26

### Patch Changes

- Updated dependencies [bcf1c5c]
  - @code-sherpas/pharos-react@3.0.1

## 0.0.25

### Patch Changes

- Updated dependencies [f482f04]
- Updated dependencies [f482f04]
  - @code-sherpas/pharos-react@3.0.0

## 0.0.24

### Patch Changes

- Updated dependencies [3a2650a]
  - @code-sherpas/pharos-react@2.4.0

## 0.0.23

### Patch Changes

- Updated dependencies [86f3e9f]
  - @code-sherpas/pharos-react@2.3.0

## 0.0.22

### Patch Changes

- Updated dependencies [c2baf46]
  - @code-sherpas/pharos-react@2.2.0

## 0.0.21

### Patch Changes

- Updated dependencies [fb5970e]
  - @code-sherpas/pharos-react@2.1.1

## 0.0.20

### Patch Changes

- Updated dependencies [628c1df]
  - @code-sherpas/pharos-react@2.1.0

## 0.0.19

### Patch Changes

- Updated dependencies [b28482c]
- Updated dependencies [069f9da]
  - @code-sherpas/pharos-react@2.0.1

## 0.0.18

### Patch Changes

- Updated dependencies [6e8766b]
  - @code-sherpas/pharos-react@2.0.0

## 0.0.17

### Patch Changes

- Updated dependencies [fc48d8f]
  - @code-sherpas/pharos-react@1.1.1

## 0.0.16

### Patch Changes

- Updated dependencies [5f4b5be]
- Updated dependencies [aed4687]
- Updated dependencies [238145b]
  - @code-sherpas/pharos-react@1.1.0

## 0.0.15

### Patch Changes

- Updated dependencies [c7ae780]
  - @code-sherpas/pharos-react@1.0.3

## 0.0.14

### Patch Changes

- Updated dependencies [820eeb3]
  - @code-sherpas/pharos-react@1.0.2

## 0.0.13

### Patch Changes

- Updated dependencies [a8a2226]
  - @code-sherpas/pharos-react@1.0.1

## 0.0.12

### Patch Changes

- Updated dependencies [195c5b1]
  - @code-sherpas/pharos-react@1.0.0

## 0.0.11

### Patch Changes

- Updated dependencies [f194e9c]
  - @code-sherpas/pharos-react@0.21.1

## 0.0.10

### Patch Changes

- Updated dependencies [b12d3b9]
  - @code-sherpas/pharos-react@0.21.0

## 0.0.9

### Patch Changes

- Updated dependencies [aeb6a34]
  - @code-sherpas/pharos-react@0.20.3

## 0.0.8

### Patch Changes

- Updated dependencies [3a5656c]
  - @code-sherpas/pharos-react@0.20.2

## 0.0.7

### Patch Changes

- Updated dependencies [51776a5]
  - @code-sherpas/pharos-react@0.20.1

## 0.0.6

### Patch Changes

- Updated dependencies [edb7de3]
  - @code-sherpas/pharos-react@0.20.0

## 0.0.5

### Patch Changes

- Updated dependencies [9781926]
  - @code-sherpas/pharos-react@0.19.0

## 0.0.4

### Patch Changes

- Updated dependencies [414d5a0]
  - @code-sherpas/pharos-react@0.18.0

## 0.0.3

### Patch Changes

- Updated dependencies [c443585]
  - @code-sherpas/pharos-react@0.17.0

## 0.0.2

### Patch Changes

- Updated dependencies [330128c]
  - @code-sherpas/pharos-react@0.16.0

## 0.0.1

### Patch Changes

- Updated dependencies [ae08347]
  - @code-sherpas/pharos-react@0.15.0
