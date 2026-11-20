# @examples/next-rsc

## 0.0.30

### Patch Changes

- Updated dependencies [9eab3a9]
  - @code-sherpas/pharos-react@5.2.1

## 0.0.29

### Patch Changes

- Updated dependencies [169fbbc]
  - @code-sherpas/pharos-react@5.2.0

## 0.0.28

### Patch Changes

- Updated dependencies [9548aec]
  - @code-sherpas/pharos-react@5.1.0

## 0.0.27

### Patch Changes

- Updated dependencies [5f928ef]
- Updated dependencies [5f928ef]
  - @code-sherpas/pharos-react@5.0.0

## 0.0.26

### Patch Changes

- 7362eb3: Requires `@code-sherpas/pharos-tokens` `^1.2.0` (was `^1.1.0`): `Dialog` reads the compact breakpoint that pharos-tokens 1.2.0 publishes (`breakpoint.compact`, 40rem; decision D32). This peer bump is the only breaking change: no component, prop or variant changes. Install pharos-tokens 1.2.0 alongside this release: `pnpm add @code-sherpas/pharos-react@^4 @code-sherpas/pharos-tokens@^1.2`.

  `Dialog` fills the screen below the compact width (a phone): no margin, no radius and no shadow, `DialogHeader` pinned at the top and `DialogFooter` at the bottom, and only what lies between them scrolls. A field the keyboard reaches under the pinned header or footer is scrolled clear of them (WCAG 2.4.11). From the breakpoint up it is the centered panel it was in 3.2.1, unchanged. The component reads the breakpoint with `matchMedia` and mirrors the form on `data-pharos-mode` (`centered` or `fullscreen`) on `DialogContent`; crossing the breakpoint with the dialog open, by turning the phone or resizing the window, only restyles the same panel, so what was typed and the focus stay. The modal contract is the same in both forms: focus moves in on open, Escape closes, and focus returns to what opened it. On the server it renders the centered form, and the browser corrects it after hydration. `AlertDialog` is not affected: a confirmation stays centered at every width.

- Updated dependencies [7362eb3]
  - @code-sherpas/pharos-react@4.0.0

## 0.0.25

### Patch Changes

- 72fe3af: `SidePanel` no longer stops a streamed page from hydrating. On a screen below `breakpoint.panel`, and on any screen with the panel open from the first render, switching to the modal form or registering the title changed the root's context while the page hydrated; React then rendered every Suspense boundary inside the panel's root that was still waiting for its HTML in the browser, so for an instant the page was in the DOM twice (the browser's copy and the server's hidden one). The mode is now read by the parts that need it, and the title and description register with `SidePanelContent`, so the root's context stays the same through hydration. No API change. `SidePanelTitle` and `SidePanelDescription` name and describe the surface they are in, so they belong inside `SidePanelContent`, as documented; outside it they now throw an error that says so, instead of labelling the panel from elsewhere.

  `examples/next-rsc` gains a page that streams beside a `SidePanel`, checked on a phone and on a desktop.

- Updated dependencies [72fe3af]
  - @code-sherpas/pharos-react@3.2.1

## 0.0.24

### Patch Changes

- Updated dependencies [671e3e0]
  - @code-sherpas/pharos-react@3.2.0

## 0.0.23

### Patch Changes

- Updated dependencies [8073aab]
  - @code-sherpas/pharos-react@3.1.1

## 0.0.22

### Patch Changes

- Updated dependencies [da52021]
  - @code-sherpas/pharos-react@3.1.0

## 0.0.21

### Patch Changes

- Updated dependencies [6839aff]
  - @code-sherpas/pharos-react@3.0.2

## 0.0.20

### Patch Changes

- Updated dependencies [bcf1c5c]
  - @code-sherpas/pharos-react@3.0.1

## 0.0.19

### Patch Changes

- Updated dependencies [f482f04]
- Updated dependencies [f482f04]
  - @code-sherpas/pharos-react@3.0.0

## 0.0.18

### Patch Changes

- Updated dependencies [3a2650a]
  - @code-sherpas/pharos-react@2.4.0

## 0.0.17

### Patch Changes

- Updated dependencies [86f3e9f]
  - @code-sherpas/pharos-react@2.3.0

## 0.0.16

### Patch Changes

- Updated dependencies [c2baf46]
  - @code-sherpas/pharos-react@2.2.0

## 0.0.15

### Patch Changes

- Updated dependencies [fb5970e]
  - @code-sherpas/pharos-react@2.1.1

## 0.0.14

### Patch Changes

- Updated dependencies [628c1df]
  - @code-sherpas/pharos-react@2.1.0

## 0.0.13

### Patch Changes

- Updated dependencies [b28482c]
- Updated dependencies [069f9da]
  - @code-sherpas/pharos-react@2.0.1

## 0.0.12

### Patch Changes

- Updated dependencies [6e8766b]
  - @code-sherpas/pharos-react@2.0.0

## 0.0.11

### Patch Changes

- Updated dependencies [fc48d8f]
  - @code-sherpas/pharos-react@1.1.1

## 0.0.10

### Patch Changes

- Updated dependencies [5f4b5be]
- Updated dependencies [aed4687]
- Updated dependencies [238145b]
  - @code-sherpas/pharos-react@1.1.0

## 0.0.9

### Patch Changes

- Updated dependencies [c7ae780]
  - @code-sherpas/pharos-react@1.0.3

## 0.0.8

### Patch Changes

- Updated dependencies [820eeb3]
  - @code-sherpas/pharos-react@1.0.2

## 0.0.7

### Patch Changes

- Updated dependencies [a8a2226]
  - @code-sherpas/pharos-react@1.0.1

## 0.0.6

### Patch Changes

- Updated dependencies [195c5b1]
  - @code-sherpas/pharos-react@1.0.0

## 0.0.5

### Patch Changes

- Updated dependencies [f194e9c]
  - @code-sherpas/pharos-react@0.21.1

## 0.0.4

### Patch Changes

- Updated dependencies [b12d3b9]
  - @code-sherpas/pharos-react@0.21.0

## 0.0.3

### Patch Changes

- Updated dependencies [aeb6a34]
  - @code-sherpas/pharos-react@0.20.3

## 0.0.2

### Patch Changes

- Updated dependencies [3a5656c]
  - @code-sherpas/pharos-react@0.20.2

## 0.0.1

### Patch Changes

- Updated dependencies [51776a5]
  - @code-sherpas/pharos-react@0.20.1
