# Naming decisions

Log of naming decisions taken while building `@code-sherpas/pharos-react`. Each
entry records the canonical name chosen for the component, the naming sources
consulted, and the mapping from Alexandria's existing vocabulary to the Pharos
API.

Sources, in priority order (see `AGENTS.md`):

1. shadcn/ui
2. Base UI / Radix primitives
3. ARIA APG
4. Other design systems (Material, Carbon, Polaris...)

Tiebreaker when two canonical sources agree on a name: pick the shorter, more
generic one.

## Cross-cutting: control border intensity (WCAG 1.4.11)

Every Pharos primitive that draws a 1px boundary around an interactive
surface — `Input`, `Button intent="secondary"`, `Badge variant="outline"` —
uses the same resting border color: `--pharos-color-neutral-500`
(oklch 52.78%, ≈ `#6b6b6b`).

### Why neutral-500

WCAG 2.2 success criterion 1.4.11 (Non-text Contrast) requires **3:1**
against the adjacent surface for the visual information that identifies
a UI component. Against a white surface:

| Token         | sRGB approx | Contrast vs `#fff` | Passes 3:1?    |
| ------------- | ----------- | ------------------ | -------------- |
| `neutral-200` | `#efefef`   | ~1.07:1            | ✗              |
| `neutral-300` | `#d9dadc`   | ~1.32:1            | ✗              |
| `neutral-400` | `#c1c1c1`   | ~1.86:1            | ✗              |
| `neutral-500` | `#6b6b6b`   | ~5.41:1            | ✓              |
| `neutral-600` | `#3c3c3c`   | ~10.5:1            | ✓ (overweight) |

The luminance threshold for 3:1 against white sits around oklch 65 %
(≈ `#959595`), which falls between our `neutral-400` and `neutral-500`.
The closest token that clears the threshold is `neutral-500`, and it
matches the precedent of accessibility-first systems:

- IBM Carbon: `border-strong-01` ≈ `#8d8d8d`
- Adobe Spectrum: outline tone ≈ `#959595`
- US Web Design System: input borders at `#565c65` (slightly darker)

Most "small primitive" libraries (shadcn, Radix Themes, Mantine) sit
around oklch 92 % (≈ 1.3:1) and do **not** meet 1.4.11. Pharos
deliberately diverges from that majority to comply.

### Visual consequence

The shift from `neutral-200/300` to `neutral-500` is perceptible: the
primitives stop "floating" on the surface and read as clearly outlined
controls — closer to Carbon / Spectrum, further from shadcn's minimal
look. Three places carry the change:

- `Input` resting border (lands at `neutral-500` from day one).
- `Button intent="secondary"` (was `neutral-200`, now `neutral-500`).
  Hover stops shifting the border tone — the background change is
  enough to express the state, and a darker hover would push past the
  3:1 minimum without benefit.
- `Badge variant="outline"` (was `neutral-300`, now `neutral-500`).

### Why no `border-width` token

Border **width** stays at a hard-coded `1px` across every primitive. The
"small primitive" school (shadcn / Mantine / Radix Themes / MUI) does
not tokenize width — `1px` is universal and varying it adds API surface
without solving real problems. The "comprehensive token" school
(Polaris, Primer, Adobe Spectrum) does tokenize it; Pharos sides with
the first school because the visibility complaint is a contrast issue,
not a width one. If a future state needs a thicker boundary (e.g. an
"emphasis" outlined variant), a token gets added then.

### Why no semantic alias yet

A semantic alias such as `--pharos-color-border-control` was considered
and deferred. The three primitives that need the value share it
explicitly through `neutral-500`, which keeps the dependency graph
visible: every consumer (CSS Module, Storybook, Alexandria adopter) can
trace the border tone back to the palette without an extra
indirection. The alias becomes worth its weight when a fourth primitive
needs the same tone or when the resting tone needs to change without a
palette migration. Until then, direct token use is simpler.

### Impact on Alexandria

Alexandria's `formFieldBaseClasses` currently use `border-supporting-base`
(the legacy alias for `#efefef`, equivalent to our `neutral-200`). At
Input adoption time the wrapper renders Pharos's `<Input>`, so the
border tone shifts to `neutral-500` for every form field that flows
through the canonical alias. The change is a deliberate visual
divergence and gets logged in `docs/migration-log.md` of
`alexandria-web-application` as part of the Input adoption PR. Button
secondary call-sites already in production absorb the same shift in
the next pharos-react release that this border change ships in.

## Button

Canonical name: **`Button`** (shadcn/ui, Base UI, ARIA APG — unanimous).

Public API:

```ts
<Button intent="primary | secondary | ghost | destructive" size="sm | md | lg">
  Label
</Button>
```

### Why `intent` instead of shadcn's `variant`

shadcn's Button uses `variant` with values `default | destructive | outline |
secondary | ghost | link`. Pharos consolidates those into a smaller, more
semantic axis:

- `intent` describes _what the action means_ (primary / secondary / ghost /
  destructive), which is easier to reason about at the design-review level than
  a purely visual name like "default" or "outline".
- The visual treatment (filled, outlined, transparent) becomes an
  implementation detail of each intent rather than a user-facing axis.
- `link` is intentionally **not** a button intent. A text link that looks like
  a link is a `<a>`, and will be exposed as a separate `Link` component when
  Pharos reaches that part of the roadmap.
- `outline` is not a separate intent either — `secondary` already covers the
  "bordered, quieter than primary" use case.

### Mapping from Alexandria

Alexandria has ~14 button-like components today (see
`ANALYSIS-components.md` in `alexandria-web-application` branch
`feat/fase-0-analysis`). They collapse into the Pharos `Button` as
follows. The table is a direct adoption contract: when
`@code-sherpas/pharos-react` ships a Button release, a PR in
`alexandria-web-application` replaces every Alexandria button
instance using these mappings.

| Alexandria component                                        | Pharos equivalent                                                                                  |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `NewButton variant="filled" tone="default"` (navy-filled)   | `<Button intent="primary">` — stays navy; the blue `primary-*` palette is brand accent, not CTA    |
| `NewButton variant="default" tone="default"` (bordered)     | `<Button intent="secondary">`                                                                      |
| `NewButton variant="text" tone="default"`                   | `<Button intent="ghost">`                                                                          |
| `NewButton variant="filled" tone="destructive"`             | `<Button intent="destructive">`                                                                    |
| `NewButton variant="default" tone="destructive"` (bordered) | `<Button intent="destructive">` — outline-destructive folds into the filled one (see below)        |
| `NewButton variant="text" tone="destructive"`               | `<Button intent="ghost">` with destructive color via `className` (until a dedicated intent exists) |
| `PrimaryButton` / `PrimaryLinkButton` (legacy, `w-[263px]`) | `<Button intent="primary">` — fixed width drops; consumers size via layout                         |
| `CtaButton`                                                 | `<Button intent="primary" size="lg">`                                                              |
| `SecondaryButton`                                           | `<Button intent="secondary">`                                                                      |
| `OutlineButton`                                             | `<Button intent="secondary">`                                                                      |
| `TextButton`                                                | `<Button intent="ghost">`                                                                          |
| `AsyncLoadingButton`                                        | `<Button>` with a forthcoming `isLoading` prop (tracked separately)                                |
| `LinkButton` (button styled as link)                        | `<Button intent="ghost" render={<Link to="..." />}>` — Button composes via Base UI's `render` prop |
| `NewLinkButton`                                             | `<Button render={<Link to="..." />}>`                                                              |
| `CloseButtonCircle`                                         | Deferred — will be covered by `IconButton` once icons land (D4)                                    |
| `DestructiveButton` / `DangerButton`                        | `<Button intent="destructive">`                                                                    |
| `IconButton`                                                | Deferred — dedicated component once Lucide integration lands (D4)                                  |

### Note on `intent="primary"` vs the `primary-*` palette

The word "primary" names two different things in Pharos, and they
intentionally do not refer to each other:

- **`primary-*` palette** (`primary-50`..`primary-900` in tokens) is the
  brand blue (`primary-600` = `#2a48e9`, sea-blue). It exists as accent
  — focus rings, active tab indicators, badges, links, highlights.
- **`<Button intent="primary">`** is the most emphasized CTA. It renders
  in **neutral-900** (dark navy-black), matching Alexandria's dominant
  `NewButton variant="filled" tone="default"` treatment and the
  Linear / Vercel / Notion convention of "brand as accent, dark neutral
  as CTA".

The name collision is a known quirk of Pharos inheriting shadcn's
"primary" palette naming while picking a CTA that is not the brand
color. Renaming the palette (to `brand-*` or `accent-*`) was
considered and rejected: it would be a major-version break of
pharos-tokens for a purely cosmetic naming concern, and the ambiguity
is bounded to one document — this one. Read "`intent="primary"`" as
"the primary action on the screen", not as "the primary-palette color".

### Deliberate visual changes at migration time

These are cases where Pharos intentionally diverges from Alexandria's
current look because following the design-system best practice is
worth the one-time visual shift. The `intent="primary"` color is **not**
on this list — it matches Alexandria's navy filled button. The shift
is only in the cases below:

- **`outline-destructive` → `intent="destructive"`**. Alexandria has
  `variant="default" tone="destructive"` (red border + red text, fills
  red on hover). Pharos folds this into the single filled destructive.
  Rationale: the two states were rarely paired in Alexandria (~5
  usages total across both), shadcn canonical is one destructive,
  and keeping two destructive visuals bifurcates the semantic axis
  without a clear user benefit.

- **Pill shape (`rounded-full`)**. Matches Alexandria's dominant
  `NewButton` shape (117 `rounded-full` usages across the codebase).
  Pharos standardizes on pill for the entire size range (sm/md/lg)
  to keep a single, coherent shape language. Legacy `PrimaryButton`
  usages (`rounded-cs-md`, 16px) visually round further at migration
  — aligned with the NewButton direction.

- **Heights 32 / 40 / 48 instead of 30 / 42**. Pharos uses an 8px
  grid throughout. `NewButton`'s 30 / 42 were one-off picks. The
  2-pixel deltas are imperceptible and the 8px alignment pays off
  when Button sits next to other controls (Input, Select, Checkbox)
  that will land on the same grid.

- **Three sizes (sm/md/lg)** vs Alexandria's two. Adds headroom for
  CTAs in marketing/landing contexts without retroactive changes.
  Migration maps Alexandria's `md` → Pharos `md` and `sm` → Pharos
  `sm`; no Alexandria call-site adopts `lg` by default.

Fase 6 is no longer a big-bang migration for simple components —
Button lands in `alexandria-web-application` via an incremental
adoption PR as soon as its pharos-react release ships to npm. This
document is the adoption contract.

## Badge

Canonical name: **`Badge`** (shadcn/ui, Primer; Polaris uses the same
term). Tiebreaker against Material's `Chip` and Polaris's `Tag`:
shadcn is the primary source per `AGENTS.md`.

Public API:

```ts
<Badge variant="default | secondary | destructive | outline | success | warning | info">
  {label}
</Badge>
```

Single axis. No `shape` axis. No built-in `onRemove`. Shape is fixed
`rounded-full` to align with `Button` — see "Why rounded-full" below.
Icons compose as plain `<svg>` children of the badge — the base style
auto-sizes any direct child SVG to `0.75em` (mirrors shadcn's
`[&>svg]:size-3`).

### Why a single `variant` axis

Modern alternatives like Mantine and Radix Themes split the axis into
`variant` (filled / subtle / outline) × `tone` (color), and that gives
combinatorial flexibility. Pharos picks the shadcn 1-axis flatten
because:

- It keeps the API surface tiny: one prop to pick from a closed list.
- The axis carries the full meaning: `destructive` already means
  "filled red", `outline` already means "transparent + border",
  `success` already means "filled green". A consumer doesn't need
  to remember which combinations are valid.
- Variant names are the contract; the visual treatment is the
  implementation. If we later add `subtle-success` or `outline-info`,
  it goes in as a new variant value, not as a new axis. The single
  list of allowed values stays the documentation.

### Why `rounded-full`

Industry is split: shadcn / Radix Themes / Polaris Badge / Bootstrap
default to `rounded-md`; Mantine, MUI Chip, and Tailwind UI status
pills default to `rounded-full`. Either choice is defensible —
none of them violates a documented best practice.

Pharos picks `rounded-full` for **internal coherence with Button**.
Button is fully rounded across every size (decision documented in the
Button entry above; aligned with Alexandria's dominant convention,
117 `rounded-full` button usages in the codebase). If Badge defaulted
to `rounded-md`, the Pharos visual language would carry two corner
languages — pill for actions, rectangle for labels — for no real
reader benefit. One shape across primitives keeps the system
recognisable as one system.

The single argument that pulled toward `rounded-md` was readability
on long badge labels (e.g. `AssessmentStatus` values such as
`"Window closed and reviews collected"`). The end-caps of a fully-
rounded long label can read as "exaggeratedly capsular". This is
acceptable in practice — the base style already sets
`white-space: nowrap` and `width: fit-content` so the badge keeps
its label intact, and the optical weight is dominated by the surface
fill, not by the corner radius. If a long-label readability problem
ever emerges, the answer is a label truncation policy, not a second
shape on Badge.

### Why the asymmetric naming (`destructive` vs `success`)

shadcn ships `default | secondary | destructive | outline`. Pharos
extends with `success | warning | info` for the semantic states every
modern DS exposes. We **keep** the shadcn name `destructive` rather
than renaming to `error`, so consumers familiar with shadcn pick the
right value without re-learning the API. The asymmetry is one-time
cognitive cost; renaming would split Pharos from its primary naming
authority for no real-world benefit.

### Mapping from Alexandria

Alexandria has three components in the badge family. **Pharos does
not mirror their APIs** — Alexandria adapts at adoption time
(cardinal rule, plan §7).

| Alexandria component                                                | Pharos equivalent                                                                   | Notes                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Pill size="sm"` (rounded-full, no variants, color via `className`) | `<Badge variant="secondary">`                                                       | Pharos keeps the rounded-full shape (coherence with Button). The 4 Alexandria call-sites with bespoke Tailwind colors map to the closest semantic variant where applicable: `success`/`warning`/`info` instead of hex-tinted classNames; the bespoke brand-blue / Platform-purple keep their `className` overrides until a Pharos variant covers them. |
| `Pill size="md"`                                                    | n/a                                                                                 | Dead code in Alexandria (zero call-sites). Not preserved in Pharos.                                                                                                                                                                                                                                                                                    |
| `Chip variant="primary"` (filled dark, removable)                   | `<Badge variant="default">` plus a sibling close button when removable UX is needed | Pharos does not bake `onRemove` into Badge. The chip-removable pattern is composition: `<span><Badge>label</Badge><button aria-label="Remove">…</button></span>`, or a dedicated `Chip` component if the pattern proliferates.                                                                                                                         |
| `Chip variant="secondary"` (filled light, removable)                | `<Badge variant="secondary">` plus close button as above                            | Same rationale.                                                                                                                                                                                                                                                                                                                                        |
| `StatusBadge` (rectangular, slot icon, status-driven copy)          | `<Badge variant="outline">` with the icon as a child                                | Pharos absorbs the icon-as-child pattern naturally — any `<svg>` rendered inside Badge auto-sizes via the base style. The status → text + icon mapping stays in the Alexandria wrapper that calls `<Badge>`.                                                                                                                                           |
| `AssessmentStatusBadge`, `PublishedDraftStatusBadge`, etc.          | wrappers in Alexandria call `<Badge>` directly                                      | These remain Alexandria-side adapters. They are domain-aware (status enum → label + icon) and do not belong in pharos-react.                                                                                                                                                                                                                           |

### Deliberate divergences from Alexandria at migration time

- **Fixed `rounded-full` shape**. Alexandria's `Pill` is rounded-full
  already, Alexandria's `Chip` is asymmetric (`rounded-l-full
rounded-tr-full`), and Alexandria's `StatusBadge` is rectangular
  (`rounded-[4px]`). Pharos collapses the three shapes into one:
  fully rounded across every variant. Pill / Chip stay close to their
  current visuals; StatusBadge becomes the noticeable shape change at
  adoption (`rounded-[4px]` → `rounded-full`), which is acceptable
  because StatusBadge already carries minimal visual weight on the
  pages that render it.
- **No built-in `onRemove`**. Alexandria's Chip ties label + close
  button into one component. Pharos models the close affordance as an
  external sibling because (a) shadcn does, and (b) it keeps Badge
  responsibilities single — display, not interaction. Alexandria's
  ~4 Chip call-sites either compose with an explicit close button or
  the team builds a dedicated `Chip` component if the count grows.
- **Semantic variants exist as first-class values**. Alexandria's
  Pill encodes status via `className` (`bg-green-100 text-green-800`).
  Pharos exposes those as `success`, `warning`, `info` directly — the
  semantic intent is in the API, not in scattered Tailwind strings.
- **Heights on the 8px grid (24px)**. Pharos Badge uses
  `--pharos-spacing-5` (20px) line-height with text-box-trim for the
  optical center; the resulting visual bounding box sits on the 8px
  grid same as Button. Alexandria's Pill / Chip / StatusBadge have
  bespoke pixel-pushes (`py-[3px] px-[8px]`, `py-[6px] px-[10px]`,
  `px-cs-sm py-cs-2xs`); Pharos folds them into the standard scale.

Adoption is incremental: when this Badge ships to npm, an Alexandria
PR replaces every Pill / Chip / StatusBadge call-site with the
mappings above. Cases that need structural rework (Chip removable
UX, AssessmentStatusBadge wrapper that depends on icon mapping) ship
the swap of the underlying primitive but defer any parent-component
restructuring to Phase 6.

## Input

Canonical name: **`Input`** (shadcn/ui, Radix Themes, Mantine —
unanimous). Material's `TextField` is a different abstraction (a
pre-composed control bundling label + input + helper); see "Why
no `error` / `helperText` props" below for why Pharos goes with
the primitive school.

Public API:

```ts
<Input size="sm | md | lg" />                  // default size: md
<Input aria-invalid="true" />                  // error state
<Input disabled />
<Input readOnly />
<Input type="email | password | search | ..." /> // any native input type
```

Single chrome (no `variant` axis). Three sizes whose heights match
the Button grid exactly so an `<Input>` and a `<Button>` of the same
size sit flush on a row.

### Why no `variant` axis

shadcn's primitive contract is "a single styled `<input>`". Mantine,
Radix Themes, and Polaris's `TextField` all follow the same shape —
the form-control atom is the chromed default. Variations come from
composition (`<Input>` inside a search box, inside a chip group,
inside a date picker) rather than from a `variant` prop on the atom
itself.

The candidate variants we considered:

- **`bordered | unstyled`** (Alexandria's current axis). The
  `unstyled` value is used inside composite widgets
  (`MultiTextInput`, `ArrayInput`) where the parent owns the chrome.
  In Pharos this is a structural concern — a parent composite wires
  a visually unstyled control into its own surface — and the right
  fix is a different primitive (or `className` override) at the
  composite level, not an axis on the atom. Deferred to the
  composite-level work in Phase 6.
- **`ghost`** for inline-edit affordances. No call-site in Alexandria
  needs it today; adding it pre-emptively would design for a
  hypothetical future requirement. Re-evaluated when an inline-edit
  pattern shows up.

### Why no `error` / `helperText` / `hideMessageSlot` props

Alexandria's Input bakes the message slot into the atom (`error`,
`helperText`, plus a reserved-space `<p>` to keep layout stable
even when no message is shown). That is a `<Field>`-level concern,
not an atom-level one — the consumer needs label + control + helper

- error all wired by the same `id` for screen readers, and that
  contract belongs to a wrapper that owns the whole field, not to the
  control.

Pharos exposes the **standard `aria-invalid` attribute** as the only
error-state hook. The CSS reacts to `[aria-invalid="true"]`,
matching shadcn / Base UI / Mantine. The actual message text and
the reserved-space slot land in a future `<Field>` molecule
(Escuela 1: composable primitives, decision 2026-04-27). Until
that molecule ships, Alexandria continues to render its existing
`<FormFieldMessage>` next to the Pharos input — see "Mapping from
Alexandria" below.

### Why no leading / trailing icon slots

shadcn does not expose icon slots on `<Input>`. The pattern is a
positioned wrapper (`<div className="relative">…</div>`) that
absolute-positions the icon over the input, and the consumer
controls placement. Alexandria already implements this via
`formFieldLeftIconClasses` / `formFieldRightIconClasses` so the
pattern is familiar.

A future `<InputGroup>` or `<TextField>` molecule may absorb the
positioned-icon pattern explicitly; the atom stays minimal.

### Why no `render` prop (unlike Button)

Button uses Base UI's `useRender` so a button can render as an
anchor (`<Button render={<Link />}>`). Inputs do not have a
meaningful "render as something else" target — `<input>` is a void
element and rendering it as a `<textarea>`, `<select>`, or anything
else changes the underlying contract entirely. Textarea ships as a
**separate atom** (next on the Phase 2 roadmap) instead of being
folded into Input via `render`.

### Mapping from Alexandria

Alexandria has one canonical Input plus a constellation of composites
that wrap or compose it. Only the canonical Input is in scope for the
adoption PR that pairs with this release; the composites are
domain-specific and stay in their bounded contexts.

| Alexandria component                                      | Pharos equivalent                                                          | Notes                                                                                                                                                                                                                                                                              |
| --------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Input variant="bordered"` (default)                      | `<Input size="md">`                                                        | Default chrome. Heights match (40px in Alexandria → `--pharos-spacing-10` in Pharos).                                                                                                                                                                                              |
| `Input variant="unstyled"`                                | n/a — composition concern                                                  | Used only inside `MultiTextInput`, `ArrayInput`, and similar composites. The composites stay structural until Phase 6; in the meantime they keep their local unstyled input. Pharos does not expose `unstyled` because the right fix is a composite-level wrapper, not an axis.    |
| `Input` props `helperText` / `error` / `hideMessageSlot`  | composition with `<FormFieldMessage>` (today) / `<Field>` molecule (later) | At adoption time, Alexandria's `Input.tsx` becomes a thin Field-style wrapper that renders `<PharosInput aria-invalid={!!error} />` plus the existing `<FormFieldMessage>`. The 11 call-sites under `@/web-application-src/common/components/form/Input` keep their current props. |
| `Textarea` (Alexandria's `Textarea/Textarea.tsx`)         | forthcoming separate Pharos atom (`<Textarea>`)                            | Out of scope of this release. Same composition rules will apply.                                                                                                                                                                                                                   |
| `ArrayInput`, `MultiTextInput`, `*Input` (career-ladders) | stay in Alexandria                                                         | Domain composites — they orchestrate add/remove rows, validation, and bounded-context state. They consume the local Alexandria `Input.tsx` (the wrapper above) and are not in scope for pharos-react.                                                                              |

### Deliberate divergences from Alexandria at migration time

- **No `error` / `helperText` props on the atom**. Alexandria's
  Input bakes the message slot in; Pharos splits the atom from the
  field-level message. Net effect for the 11 canonical call-sites
  is **zero** — Alexandria's wrapper preserves the prop surface.
  The divergence becomes visible when a future `<Field>` molecule
  ships and the wrapper goes away.
- **`aria-invalid` is the contract**. Alexandria toggles
  `border-red-600` via a className branch on `error`. Pharos does
  the same border + ring shift via `[aria-invalid="true"]` in CSS,
  so the contract for "this input is in error" is the standard
  ARIA attribute that screen readers already understand, not a
  prop name unique to the wrapper.
- **`focus-visible` ring uses the brand accent**. Alexandria's
  `formFieldBaseClasses` use `ring` (the project's CSS variable that
  resolves to a neutral). Pharos uses the same two-stop ring as
  Button (`primary-600` outer, base-white inner) so the system has
  a single focus look across pressable controls and form fields.
  Deliberate, one-time visual shift at adoption.

Adoption is incremental: when this Input ships to npm, an Alexandria
PR rewires the local `Input.tsx` to render `<PharosInput>` plus the
existing `<FormFieldMessage>`, with no caller-side changes. The 11
call-sites under the canonical alias absorb the swap transparently.
The local Input wrapper is preserved (same pattern used for `Pill`
→ `Badge` wrappers); a follow-up PR removes it once the `<Field>`
molecule lands.
