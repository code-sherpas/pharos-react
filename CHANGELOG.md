# @code-sherpas/pharos-react

## 0.17.0

### Minor Changes

- c443585: Add `Checkbox` — a single square selection control (the shadcn Checkbox contract over Base UI's `Checkbox`: `role="checkbox"` with `aria-checked="mixed"` for the indeterminate state, a hidden form input, Space to toggle, and the shared Button/Input focus ring).

  First of the form-control family (Checkbox → Switch → Radio). Label-less by design (Escuela 1) — pair with a `<label htmlFor>`; error via `aria-invalid`. Indeterminate is a boolean `indeterminate` prop (Base UI's shape, not shadcn's `checked="indeterminate"` union). Check/dash marks are inline SVG — no icon dependency added to the bundle.

## 0.16.0

### Minor Changes

- 330128c: Add `Dialog` — a centered modal panel (the shadcn Dialog contract over Base UI's `Dialog`: focus trap, scroll lock, backdrop, Escape / backdrop-click dismiss, focus return to the trigger).

  Compound parts: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`. Sibling of `Sheet` (same Base UI primitive) — Dialog is the centered modal, Sheet the edge-docked panel. `DialogContent` collapses Base UI's `Portal` + `Backdrop` + `Popup` and shares the `--pharos-z-index-popover` overlay layer so a `Select` / `Popover` opened from inside the dialog still stacks above it.

## 0.15.0

### Minor Changes

- ae08347: Add `Sheet` — a modal panel that docks to a viewport edge and slides in (the shadcn Sheet contract over Base UI's `Dialog`: focus trap, scroll lock, backdrop, Escape / backdrop-click dismiss, focus return to the trigger).

  Compound parts: `Sheet`, `SheetTrigger`, `SheetContent` (with a `side` axis: `top | right | bottom | left`, default `right`), `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetFooter`, `SheetClose`, plus the `sheetVariants` helper. `SheetContent` collapses Base UI's `Portal` + `Backdrop` + `Popup` and shares the `--pharos-z-index-popover` overlay layer so a `Select` / `Popover` opened from inside the sheet still stacks above it. Distinct from `Popover` (non-modal, anchored) and `DropdownMenu` (menu-button).

## 0.14.3

### Patch Changes

- d67e70c: fix(Combobox): anchor the multi-select popup to the chips control box, not the input

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

## 0.14.2

### Patch Changes

- d70eb1a: fix(overlays): give the anchored popups a configurable z-index so they clear host-app overlays

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

## 0.14.1

### Patch Changes

- a9605d8: fix(Select): anchor the listbox below the trigger instead of overlapping it

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

## 0.14.0

### Minor Changes

- 6345498: Add the `Select` and `Combobox` atoms — the selection family (Decision D17).

  Two atoms split by interaction contract, matching the shadcn / Base UI / ARIA
  APG consensus:
  - **`Select`** — pick from a known set of options (the ARIA listbox pattern,
    no text input). Wraps Base UI's `Select.*`. Parts: `Select`, `SelectTrigger`,
    `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`,
    `SelectSeparator`.
  - **`Combobox`** — a text input that filters a known set (the APG combobox
    pattern). Wraps Base UI's `Combobox.*`. Parts: `Combobox`, `ComboboxControl`,
    `ComboboxChips`, `ComboboxInput`, `ComboboxTrigger`, `ComboboxClear`,
    `ComboboxChip`, `ComboboxChipRemove`, `ComboboxContent`, `ComboboxList`,
    `ComboboxItem`, `ComboboxEmpty`, `ComboboxGroup`, `ComboboxGroupLabel`,
    `ComboboxSeparator`.

  Multi-select is the `multiple` axis on each root (not a separate atom);
  single-select closes on pick, multi-select keeps the popup open. Both popups
  take `min-width: var(--anchor-width)` so they are never narrower than their
  control. The trigger/control share the Input chrome (WCAG 1.4.11 border tone,
  brand focus ring, `sm`/`md`/`lg` size grid). Following Escuela 1 (D11) neither
  atom owns label/helper/error — compose those and convey error via
  `aria-invalid`.

## 0.13.0

### Minor Changes

- 0cb3869: Add the `Popover` compound atom (Decision D16).

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

## 0.12.0

### Minor Changes

- 270aec0: Add the `DropdownMenu` compound atom (Decision D15).

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

## 0.11.1

### Patch Changes

- f052ca8: Mark the published ESM bundle as client-only via a `"use client"` banner.

  Avatar (D14) calls `createContext(...)` three times at module top level
  (shape / loading / group). Without the banner, Next.js evaluates the
  Pharos module during its RSC build-time analysis pass and fails with
  `TypeError: (0 , c.createContext) is not a function` while collecting
  page data for any route whose layout transitively imports an Avatar.

  The banner is the same convention every React DS ships with
  (MUI / Chakra / Radix / shadcn). The atoms that have no hooks
  (Card / Separator) lose server-render-ability as a side effect; this is
  acceptable since they were never advertised as server-safe and React DS
  libraries are universally client-only today.

  The Avatar source file also carries its own `"use client"` directive so
  the intent is visible to anyone reading the source.

## 0.11.0

### Minor Changes

- 584821e: Add the `Avatar` compound atom (Decision D14). Ships `Avatar`,
  `AvatarImage`, `AvatarFallback`, and `AvatarGroup` as named exports.
  - Three named sizes (`sm` / `md` / `lg` = 32 / 40 / 48 px) align with
    the IconButton height grid; a numeric `size={number}` writes
    `width` / `height` inline for one-off cases (profile pictures,
    compact stacks).
  - Two shapes (`circle` default, `square` via the `radius-md` token).
  - Compound API (`AvatarImage` + `AvatarFallback`) follows the
    shadcn / Radix / Base UI / Chakra contract — the fallback content is
    composed explicitly by the consumer (Escuela 1, D11). No magic
    `name` prop, no built-in initials computation.
  - `AvatarGroup` stacks Avatar children with proportional negative
    margin and a `box-shadow` ring that defaults to the page surface
    (`--pharos-avatar-group-ring`). The `max` prop caps visible avatars
    and collapses the surplus into a final `+N` Avatar with accessible
    name `{N} more`.
  - `render` prop on the root composes the Avatar as a different element
    while keeping its styles (e.g. `render={<a href="/profile" />}`).
  - No status-badge primitive in v1 — deferred to composition with a
    future Badge positioning helper.

## 0.10.0

### Minor Changes

- a3f5ef3: Add `IconButton` atom — icon-only pressable control. Dedicated atom rather than a `<Button size="icon">` variant (Decision D13, 2026-04-30): six of eight top-tier DSes ship a dedicated `IconButton` (Material 3, MUI, Chakra, Radix Themes, IBM Carbon, plus Mantine's `ActionIcon`), and a dedicated atom enforces `aria-label` (or `aria-labelledby`) at the **type level** instead of leaving WCAG 4.1.2 compliance as a runtime warning the way Chakra / Mantine do.

  Public API mirrors Button: `intent="primary | secondary | ghost | destructive"` × `size="sm | md | lg"` × native `<button>` props × Base UI `render` prop for composition (`<IconButton render={<Link to="/next" />} aria-label="Next">`). Defaults: `intent="ghost"` (the dominant icon-only case is low-emphasis — close, dismiss, toolbar action), `size="md"`. Square dimensions matching the Button height grid (32 / 40 / 48 px); `border-radius: var(--pharos-radius-full)` produces a perfect circle. Direct-child `> svg` selector sizes Lucide icons (which ship with hardcoded `width="24" height="24"`) to 16 / 20 / 24 px to match the icon slot.

  `isLoading` prop wired into the atom because the icon-only case is materially worse without it: with a Button the consumer can compose `<Button disabled><Spinner /><span>Saving</span></Button>`, but with an IconButton the slot has to be **swapped** (icon while idle, Spinner while loading), forcing two render branches at every async call-site. Setting `isLoading` swaps the slot for `<Spinner size={size}/>`, sets `disabled`, and exposes `aria-busy="true"`.

  No integrated Tooltip (diverges from IBM Carbon's mandatory tooltip): `aria-label` already satisfies WCAG 4.1.2; tooltip is a separate composition concern and a separate atom (not yet shipped). No `selected` toggle state in v1: no Alexandria call-site exercises the toggle pattern today; additive when needed.

  Adoption contract documented in `NAMING-decisions.md` — the release pairs with an Alexandria PR that replaces `CloseButton`, `CloseButtonCircle`, `NextCircleButton`, `PreviousCircleButton` with the corresponding `<IconButton>` mappings, and folds the icon-only call-sites of `AsyncLoadingButton` / `PublishButton` / `UnpublishButton` / `AddButton` into the atom's built-in `isLoading`.

## 0.9.0

### Minor Changes

- 92d84b0: Add `Spinner` atom — visual loading indicator with `role="status"` for assistive tech, three sizes (`sm` / `md` / `lg`) aligned with the form-control grid (16 / 20 / 24 px), and `currentColor` inheritance so it picks up the parent's text colour automatically (composition cases like `<Button intent="primary"><Spinner /></Button>` work out of the box, no `Button isLoading` prop required at the atom level).

  Inline SVG with CSS `@keyframes` rotation — zero icon-library dependencies (no `lucide-react`, no `framer-motion`). Honours `prefers-reduced-motion` by slowing the rotation to 4 s instead of removing it (assistive UX still benefits from the in-progress cue).

  `srLabel` prop (default `"Loading…"`) is rendered as visually-hidden text inside the status node; pass an action-specific label (`"Saving template…"`, `"Deleting…"`) when relevant. No `tone` axis on the atom; consumers set the colour by setting `color` on the parent or via `className` — same pattern Radix Themes / shadcn / Mantine use.

## 0.8.0

### Minor Changes

- 1eab57c: Add `Textarea` atom — multi-line text input that mirrors the form-control chrome of `Input` (border tone `neutral-500` for WCAG 1.4.11 compliance, identical focus ring, identical inline padding per size). No `variant` axis (composition Escuela 1, decision D11): error state via `aria-invalid="true"`, message text rendered by the consumer or by the future `<Field>` molecule.

  Three `size` values (`sm` / `md` / `lg`) align inline padding and font-size with `Input` so a textarea sits flush next to inputs in the same form. Vertical dimension uses `min-height` (~3-4 lines at the size's font-size) plus `resize: vertical` so users can drag the bottom edge to grow it; consumers can override via `style.resize` if needed.

## 0.7.0

### Minor Changes

- b1680e6: Add `Card` atom with the slot family `CardHeader`, `CardTitle`,
  `CardDescription`, `CardContent`, `CardFooter`.

  Public API:

  ```tsx
  <Card variant="default | elevated | outlined">
    <CardHeader>
      <CardTitle>Title</CardTitle>
      <CardDescription>Description</CardDescription>
    </CardHeader>
    <CardContent>{children}</CardContent>
    <CardFooter>{actions}</CardFooter>
  </Card>
  ```

  Three variants on the border-intensity hierarchy (Decision D12):
  - `default` — subtle border `--pharos-color-neutral-200`, no shadow.
    ~85 % of Alexandria's container surfaces map here.
  - `elevated` — soft shadow `--pharos-shadow-md`, no border. For
    surfaces that should lift off the canvas (modal inner surfaces,
    callouts).
  - `outlined` — emphasised border `--pharos-color-neutral-300`, no
    shadow. The middle tier — deliberately more visible than `default`
    but still non-interactive, so it never reaches the strong
    `neutral-500` reserved for `Input` / `Button intent="secondary"` /
    `Badge variant="outline"` (D10).

  Sub-components are exported as individual primitives, the same
  pattern shadcn uses. Every slot is optional; an empty Card or a
  content-only Card is equally valid. `CardTitle` renders as a `<div>`
  on purpose — atoms do not impose document-outline semantics; the
  consumer wraps in `<h2>` / `<h3>` or sets `role="heading"` +
  `aria-level` themselves.

  This release closes the second half of the post-Input visual
  disonance fix: `Separator` (this same release) and `Card`
  (`variant="default"`) share the subtle `neutral-200` tone, so once
  Alexandria adopts both, the running app expresses three readable
  boundary levels — subtle (separator + default card), emphasised
  (outlined card), strong (interactive controls). The Input that
  previously read as "out of place" reads as deliberately the focal
  interactive element.

  Cross-DS rationale and Alexandria mapping live in
  `NAMING-decisions.md` under "Card".

- a6a1319: Add `Separator` atom — visual or semantic divider between two regions.

  Public API:

  ```tsx
  <Separator orientation="horizontal | vertical" decorative={true | false} />
  ```

  Defaults: `orientation="horizontal"`, `decorative={true}`. Native
  `<div>` props pass through unchanged.

  The atom is the first realisation of **Decision D12** (subtle borders
  for non-interactive surfaces). Resting tone is
  `--pharos-color-neutral-200`, the same intensity Carbon `border-subtle`,
  Adobe Spectrum gray-200 and Polaris use for dividers. WCAG 1.4.11 does
  not apply (a separator is not a UI component or a state indicator), so
  the strong `neutral-500` reserved for interactive controls (Input,
  Button secondary, Badge outline — D10) deliberately stays out of this
  primitive.

  When `decorative={true}` (default) the element is `role="none"` and
  ignored by assistive tech. When `decorative={false}` it becomes
  `role="separator"` and, for vertical separators, exposes
  `aria-orientation="vertical"` (per the ARIA APG spec, the attribute is
  omitted on horizontal separators because that is the role's default).

  The cross-DS rationale, the contrast math and the three-level border
  hierarchy that lands with this release live in `NAMING-decisions.md`
  under "Cross-cutting: border intensity hierarchy".

  Adoption note: the upcoming Alexandria PR audits the ~80 ad-hoc divider
  call-sites (`<hr>` + `border-t`/`border-b` + `<div className="h-px ..." />`)
  and swaps the standalone divider patterns to `<Separator>`. Tailwind
  borders that are actually a side of a Card surface stay on the
  container until `Card` ships next.

## 0.6.0

### Minor Changes

- 5e62499: Add `Input` atom — the first form-control primitive in Pharos.

  Single chrome (no `variant` axis) with three sizes (`sm | md | lg`) whose
  heights match the Button grid. Native HTML `<input>` props pass through
  unchanged. Error state is conveyed through the standard
  `aria-invalid="true"` attribute, not a custom `error` prop — the CSS
  reacts to the attribute, matching shadcn / Base UI / Mantine. Helper /
  message text and the surrounding label are the consumer's responsibility
  (Escuela 1 composition); a `<Field>` molecule that encapsulates the full
  label + control + message contract is planned for a later release.

  Public API:

  ```tsx
  <Input size="sm | md | lg" />
  <Input aria-invalid="true" />
  <Input disabled />
  <Input readOnly />
  ```

  The Alexandria → Pharos mapping is documented in `NAMING-decisions.md`.
  At adoption time, Alexandria's local `Input.tsx` becomes a thin
  Field-style wrapper that renders `<PharosInput aria-invalid={...} />`
  plus the existing `<FormFieldMessage>` — the same incremental pattern
  used for `Pill → Badge`, so the 11 call-sites under
  `@/web-application-src/common/components/form/Input` keep their current
  prop surface.

  This release also normalises the resting border of every outlined
  primitive to `--pharos-color-neutral-500`, which clears WCAG 1.4.11
  (Non-text Contrast, 3:1 against the surface). Three components carry
  the deliberate visual shift:
  - `Input` — lands at `neutral-500` from day one.
  - `Button intent="secondary"` — was `neutral-200`, now `neutral-500`;
    hover no longer shifts the border tone (background change is
    enough to express the state).
  - `Badge variant="outline"` — was `neutral-300`, now `neutral-500`.

  The cross-DS rationale, the contrast math, and the visual trade-off
  live in `NAMING-decisions.md` under "Cross-cutting: control border
  intensity (WCAG 1.4.11)".

## 0.5.1

### Patch Changes

- 3f34353: `Badge` shape changes from `rounded-md` to `rounded-full` for visual
  coherence with `Button`. No API change; `<Badge variant="...">` keeps
  the same props and the same seven variants. Consumers see only the
  corner radius change in `dist/styles.css`.

  Rationale: the Pharos Button is fully rounded across every size
  (documented in `NAMING-decisions.md`, aligned with Alexandria's
  dominant 117 `rounded-full` button usages). A `rounded-md` Badge
  sitting next to a `rounded-full` Button gives the system two corner
  languages — pill for actions, rectangle for labels — for no reader
  benefit. One shape across primitives keeps Pharos recognisable as
  one system. Industry is split (shadcn / Polaris / Bootstrap default
  to `rounded-md`; Mantine / MUI Chip / Tailwind UI status pills
  default to `rounded-full`); neither choice violates a documented
  best practice. Picking `rounded-full` resolves the internal
  inconsistency.

  `white-space: nowrap` and `width: fit-content` were already in place
  to keep long labels intact.

## 0.5.0

### Minor Changes

- 58e4d83: Add `Badge` component (second atom of Phase 2). State-of-the-art
  shadcn-style API: a single `variant` axis with seven values
  (`default`, `secondary`, `destructive`, `outline`, `success`,
  `warning`, `info`). One shape (rounded-md rectangle), no built-in
  `onRemove` — chip-removable UX is composed externally with a sibling
  button.

  Public exports:
  - `Badge` — the component.
  - `badgeVariants` — CVA helper for consumers that need to style a
    custom element with the same variant classes.
  - `BadgeProps` — type for the props.

  Tokens consumed: `--pharos-color-neutral-{100,300,900}`,
  `--pharos-color-base-white`,
  `--pharos-color-semantic-{success,warning,error,info}-{fg,on}`,
  `--pharos-radius-md`, `--pharos-spacing-{1,2,5}`,
  `--pharos-font-family-sans`, `--pharos-font-size-xs`,
  `--pharos-font-weight-medium`.

  Naming and migration mapping from Alexandria's `Pill` / `Chip` /
  `StatusBadge` is documented in `NAMING-decisions.md` per the
  state-of-the-art rule (PLAN §7, AGENTS.md): Alexandria adapts to
  Pharos at adoption time, not the reverse.

## 0.4.0

### Minor Changes

- 27f233f: Remove `PharosHello` (seed component used only to validate the publishing
  pipeline) and its named exports `PharosHello` and `PharosHelloProps`.
  The Phase 2 atom roadmap supersedes it: `Button` is the first real component
  and the rest of the atoms follow.

  Tagged `minor` rather than `major` because the package is still in 0.x
  (per npm convention, breaking changes in 0.x bump minor; reserving the 1.0
  jump for an explicit "API now stable" milestone).

  Migration: any consumer importing `PharosHello` removes the import. There
  are no behavioural replacements — the component never had a production use
  case.

## 0.3.0

### Minor Changes

- 296f8d3: Migrate the published bundle from Tailwind v4 + CVA-with-utility-strings to **CSS Modules** (Decision D9). The bundle now contains zero `@layer` rules, zero preflight, zero global resets, and no Tailwind classes — just hashed CSS Modules class names that the React components reference. Consumers can use `pharos-react` regardless of whether their app uses Tailwind v3, v4, or no CSS framework at all.

  **Why this is a real change for consumers, not just an internal refactor**

  Earlier releases (`0.1.0`–`0.2.2`) shipped Tailwind v4 compiled output with `@layer base`, `@layer utilities`, and a global preflight in `dist/styles.css`. Tailwind v3's PostCSS plugin (used by Next.js + Tailwind v3 apps) reinterpreted that output as Tailwind source and failed with `@layer base is used but no matching @tailwind base directive`. Even consumers without Tailwind v3 received an unwanted CSS reset.

  The new bundle is a flat list of hashed-class rules and CSS variables sourced from `--pharos-*` tokens. No PostCSS plugin can misinterpret it. It works the same in every React stack.

  **Public API surface**
  - Components and props are unchanged. `Button` accepts the same `intent` / `size` axes, the same `render` prop, the same children.
  - Each component now sets `data-pharos-intent` and `data-pharos-size` attributes on its rendered element. Tests, e2e suites, and consumer CSS can use these as stable hooks (the underlying class names are hashed and not part of the API).
  - `cn` is now a `clsx` shim — `tailwind-merge` is no longer a dependency. Consumers that need Tailwind class-conflict resolution should use their own `tailwind-merge` helper. Pharos's class names are CSS Modules hashes that no resolver would touch anyway.
  - `tailwindcss`, `@tailwindcss/vite`, `tailwind-merge` removed from this package's dependency tree.

  **Consumer migration**

  For most consumers, no code change is required — the package's exports are byte-compatible at the `.tsx` level. If you were relying on:
  - A specific Tailwind utility class on a Pharos component (e.g. asserting in a test that `<Button>` has `bg-neutral-900`), switch to the `data-pharos-intent="primary"` / `data-pharos-size="md"` attributes.
  - The Tailwind preflight that used to ship inside `pharos-react/styles.css`, you must now provide your own (typical apps already do).
  - The exported `cn` helper for `tailwind-merge` semantics, install `tailwind-merge` directly.

## 0.2.2

### Patch Changes

- 719ac6e: Fix `dist/index.d.ts` shipping as an empty `export {}` — every previously published release (0.1.0, 0.2.0, 0.2.1) failed to expose `Button`, `ButtonProps`, `PharosHello`, `cn` to TypeScript consumers. Root cause: `vite-plugin-dts` with `rollupTypes: true` uses API Extractor, which silently fails when TypeScript is newer than its bundled compiler engine and produces an empty barrel. Disabled `rollupTypes` and added a dedicated `tsconfig.build.json` (`rootDir: src`) so per-file declarations are emitted directly under `dist/` and the public exports resolve correctly. No runtime change.

  Also wires a `verify:dist-types` smoke check directly into `pnpm build`: a tiny consumer file under `tests/dist-types-smoke.ts` imports every public symbol from the built `dist/` and is type-checked with a dedicated `tsconfig.dist-smoke.json`. Any future regression that ships an empty / incomplete barrel — for any reason — fails the build step (and therefore CI, `prepublishOnly`, and local builds) before a release can be cut.

## 0.2.1

### Patch Changes

- 893e2eb: Bump `@code-sherpas/pharos-tokens` peer range from `^0.3.0` to `^0.4.0`. Picks up Decision D8 (default sans-serif is now Outfit-first + Inter fallback) and the relaxed `engines.node>=22` of the tokens package. No source change in this package.

## 0.2.0

### Minor Changes

- b8adc16: add Button component, adopt Base UI render prop, complete token theme mapping

  First Pharos component, following shadcn/ui canonical naming:
  - Variants via CVA: `intent` (`primary` / `secondary` / `ghost` /
    `destructive`) and `size` (`sm` / `md` / `lg`).
  - Native `<button>` with `type="button"` default, full keyboard
    activation, and `focus-visible` rings tied to Pharos tokens.
  - Composition via Base UI's `render` prop (element or function) so
    consumers can render the Button as a router `<Link>`, an anchor, or
    any wrapper without losing styling or behavior. Powered by
    `useRender` from `@base-ui/react` (added as peer dependency).

  Alongside the component, the `@theme inline` block in
  `src/styles/index.css` now maps **every** Pharos token category onto
  Tailwind v4's theme namespaces — colors, radius, spacing, typography
  (families, sizes, weights, line heights, letter spacing), shadows,
  motion (duration + easing) and z-index. Every utility class that
  pharos-react or its consumers rely on (`p-4`, `text-sm`, `shadow-md`,
  `ease-out`, `z-modal`, ...) resolves to a `--pharos-*` CSS var, which
  means a runtime override at the `--pharos-*` layer propagates to the
  whole UI.

  See `NAMING-decisions.md` for the Alexandria → Pharos mapping.

## 0.1.0

### Minor Changes

- d03c498: Initial release — scaffolded React component library consuming
  `@code-sherpas/pharos-tokens` via `@theme inline`.

  Ships a single demo component (`PharosHello`), the `cn` helper on top of
  `clsx` + `tailwind-merge`, and the compiled stylesheet at
  `@code-sherpas/pharos-react/styles.css`. Intended as a baseline so
  downstream consumers (`alexandria-design`, `alexandria-web-application`)
  can start integrating the import path and peer-dependency chain before
  real components land in Phase 2.
