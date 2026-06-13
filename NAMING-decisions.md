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

## Cross-cutting: border intensity hierarchy

Pharos expresses a deliberate three-level hierarchy of border tones,
mapped to the **role the boundary plays in the UI** rather than to a
visual style:

| Role                                          | Token                        | Approx contrast vs white | Examples                                                        |
| --------------------------------------------- | ---------------------------- | ------------------------ | --------------------------------------------------------------- |
| **Interactive control** (D10)                 | `--pharos-color-neutral-500` | ~5.41:1                  | `Input`, `Button intent="secondary"`, `Badge variant="outline"` |
| **Container surface, emphasised**             | `--pharos-color-neutral-300` | ~1.32:1                  | `Card variant="outlined"` (planned)                             |
| **Container surface, subtle / divider** (D12) | `--pharos-color-neutral-200` | ~1.07:1                  | `Card variant="default"` (planned), `Separator`                 |

Reading top-to-bottom: **interactive things have the strongest
boundary; non-interactive things have a soft boundary**. This is the
state-of-the-art split (Carbon `border-strong` / `border-subtle`,
Adobe Spectrum, Polaris, Material 3 `outline` / `outline-variant`)
and the resolution to the post-Input visual disonance that triggered
D12 — Inputs no longer "stand out wrongly", they stand out
**deliberately** because they carry the focal-control role in the
hierarchy.

### Strong tier — `neutral-500` (D10, 2026-04-27)

Every Pharos primitive that draws a 1px boundary around an interactive
surface uses the same resting border color: `--pharos-color-neutral-500`
(oklch 52.78%, ≈ `#6b6b6b`).

#### Why neutral-500

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

#### Visual consequence

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

#### Why no `border-width` token

Border **width** stays at a hard-coded `1px` across every primitive. The
"small primitive" school (shadcn / Mantine / Radix Themes / MUI) does
not tokenize width — `1px` is universal and varying it adds API surface
without solving real problems. The "comprehensive token" school
(Polaris, Primer, Adobe Spectrum) does tokenize it; Pharos sides with
the first school because the visibility complaint is a contrast issue,
not a width one. If a future state needs a thicker boundary (e.g. an
"emphasis" outlined variant), a token gets added then.

#### Why no semantic alias yet

A semantic alias such as `--pharos-color-border-control` was considered
and deferred. The three primitives that need the value share it
explicitly through `neutral-500`, which keeps the dependency graph
visible: every consumer (CSS Module, Storybook, Alexandria adopter) can
trace the border tone back to the palette without an extra
indirection. The alias becomes worth its weight when a fourth primitive
needs the same tone or when the resting tone needs to change without a
palette migration. Until then, direct token use is simpler.

#### Impact on Alexandria

Alexandria's `formFieldBaseClasses` currently use `border-supporting-base`
(the legacy alias for `#efefef`, equivalent to our `neutral-200`). At
Input adoption time the wrapper renders Pharos's `<Input>`, so the
border tone shifts to `neutral-500` for every form field that flows
through the canonical alias. The change is a deliberate visual
divergence and gets logged in `docs/migration-log.md` of
`alexandria-web-application` as part of the Input adoption PR. Button
secondary call-sites already in production absorb the same shift in
the next pharos-react release that this border change ships in.

### Subtle tier — `neutral-200` (D12, 2026-04-27)

Every Pharos primitive that draws a 1px boundary around a non-interactive
surface — currently `Separator`, with `Card variant="default"`
following in the next release — uses `--pharos-color-neutral-200`
(oklch 95.21%, ≈ `#efefef`).

#### Why neutral-200

WCAG 1.4.11 (Non-text Contrast) does **not** apply to non-interactive
container boundaries or to decorative dividers — the success criterion
targets visual information that identifies a UI component or its
state, neither of which a separator or a card surface qualifies as.
The right tone is therefore the one that reads as a soft partition
without competing for visual attention with the interactive controls
sitting on top of it. Across DSes that are explicit about this
hierarchy:

- IBM Carbon: `border-subtle: #e0e0e0` (~oklch 92%)
- Adobe Spectrum: gray-200
- Polaris: `--p-color-border` (~oklch 92%)
- Material 3: `outline-variant`

All of them sit at the same intensity Pharos's `neutral-200` lands.

#### Why a stronger `outlined` tier exists too

Some surfaces benefit from a deliberately more visible boundary —
emphasis cards, callout panels — without ever being interactive.
Those use `--pharos-color-neutral-300` (~1.32:1), exposed as
`Card variant="outlined"` when the Card atom ships. Reusing the
`neutral-500` strong-tier tone for this would over-state the
container as if it were interactive, breaking the hierarchy.

#### Why no semantic alias yet

Same reasoning as the strong tier: the three primitives that share
the subtle tone reference `neutral-200` directly so the dependency
graph stays visible. Aliases like `--pharos-color-border-subtle`
or `--pharos-color-border-control` enter the system when a fourth
consumer of either tone appears.

#### Visual consequence

After both Separator and Card ship and Alexandria adopts them, the
running app expresses three readable border levels: subtle (`neutral-200`)
for separators and most card surfaces; emphasized (`neutral-300`) for
outlined cards; strong (`neutral-500`) for every interactive control.
The Input that previously read as "out of place" now reads as
deliberately the strongest-bounded element on the page, because the
hierarchy is finally expressed coherently across primitives.

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

## Separator

Canonical name: **`Separator`** (shadcn/ui, Radix Themes, ARIA APG).
Material's `Divider` is rejected as the canonical name because the
ARIA role is `separator` and the closer match wins (regla "shadcn >
Base UI > ARIA APG" — naming priority in `AGENTS.md`).

Public API:

```ts
<Separator orientation="horizontal | vertical" decorative={true | false} />
```

Defaults: `orientation="horizontal"`, `decorative={true}`. Native
`<div>` props pass through (`id`, `className`, `aria-label`, `style`,
data attributes). No `tone` axis on the atom — see "Why no tone axis"
below.

### Why a single subtle border tone (Decision D12)

Border tone is `--pharos-color-neutral-200` (~1.07:1 vs white).
**WCAG 1.4.11 (Non-text Contrast) does not apply** — the success
criterion targets visual information that identifies a UI component
or its state, and a separator is neither a UI component nor a state
indicator. Carbon (`border-subtle: #e0e0e0`), Adobe Spectrum
(gray-200), Polaris (`--p-color-border`) and Material 3
(`outline-variant`) all sit at the same intensity for dividers, for
the same reason.

The matching tone is what produces the system-wide visual hierarchy
that D12 codifies: **interactive controls (`Input`, `Button
secondary`, `Badge outline`) carry the strong `neutral-500` border
that clears WCAG 1.4.11; non-interactive surfaces (Separator, Card)
carry the subtle `neutral-200` border**. After both sides of the
hierarchy ship, the previously-flagged "Input desentona" problem
resolves: the Input reads as deliberately the focal interactive
element, not as visually inconsistent.

### Why no `tone` axis

Adding `tone="subtle | default | strong"` was considered and
deferred. Reasons:

- shadcn / Radix Themes / Mantine all ship a single-tone Separator.
  No precedent in canonical sources for a tone axis.
- The two real use-cases for a "stronger" divider (between major
  page sections; around an emphasis container) are better served by
  a different primitive — `Card variant="outlined"` for the
  container case, `<Section>` (future) for the page-level partition
  case. A tone axis on Separator would invite consumers to reach
  for it before the right primitive exists.
- A Separator with three tones doubles as a colour selector for
  decorative chrome — outside the atom's responsibility.

If a real call-site appears that genuinely needs a stronger
separator and no other primitive fits, a `tone` axis can be added
without breaking the current API (default stays `subtle`).

### Why we inline the `<div role>` rather than depend on `@radix-ui/react-separator`

Radix's Separator is a thin wrapper (~5 lines) over `<div role="...">`

- `aria-orientation`. Pulling it in would add a peer dependency for a
  component that has no internal state, no portal, no focus management
  — nothing that justifies an extra runtime. The non-negotiable rule
  "do not re-export `@radix-ui/*` directly" still applies; inlining
  avoids both the re-export and the dependency.

### `decorative` semantics

- `decorative={true}` (default) → `role="none"`. Assistive tech
  ignores the node. Use for visual chrome (a faint line between two
  paragraphs, between flex-row items, etc.).
- `decorative={false}` → `role="separator"`. Use when the line
  carries a logical partition that screen readers should announce
  (e.g. between two groups inside a menu, between two sections of a
  long form).

For semantic separators, `aria-orientation` follows the ARIA APG
spec: it defaults to `horizontal`, so the attribute is omitted on
horizontal separators and emitted only on vertical ones — same
approach as Radix and shadcn.

### Mapping from Alexandria

Alexandria has no canonical `Separator` component today; dividers
are spread across Tailwind utilities and ad-hoc elements:

| Alexandria pattern                                                     | Pharos equivalent  | Notes                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<hr />` (5 occurrences)                                               | `<Separator />`    | Drop-in. The atom resets the user-agent margin so spacing has to come from the layout (flex/margin), as it should.                                                                                                                                                                                                                                                      |
| `border-t` / `border-b` Tailwind utilities used as standalone dividers | `<Separator />`    | Only when the border is genuinely a divider line, not a side of a Card. Borders on container surfaces stay in the Card primitive. Recon: 74 `border-t`/`border-b` usages in Alexandria; the swap audit during the adoption PR triages container-vs-divider per call-site.                                                                                               |
| `<div className="h-px bg-..." />` (1 occurrence)                       | `<Separator />`    | Same drop-in.                                                                                                                                                                                                                                                                                                                                                           |
| `AssessmentReviewSeparator`, `BreadcrumbSeparator`, `DotSeparatorIcon` | stay in Alexandria | Domain-specific composites: `AssessmentReviewSeparator` carries assessment vocabulary, `BreadcrumbSeparator` is a chevron icon between breadcrumb segments, `DotSeparatorIcon` is a bullet glyph. None of them is a 1px line with the `separator` ARIA contract; they are presentational widgets that consume `<Separator>` only if they need to compose with the atom. |

### Deliberate divergences from Alexandria at migration time

- **Border tone moves to `neutral-200` (token-driven) from whatever
  Tailwind class was in place at each call-site** (`border-supporting-base`,
  `border-grey`, `bg-supporting-base`, etc.). Visual tone is
  essentially identical (~oklch 95-97%); the change is system
  coherence, not appearance.
- **Self-resetting margin**. The atom strips the user-agent
  `<hr>` margin so spacing is the consumer's responsibility. Some
  call-sites that relied on the implicit `<hr>` margin will need
  explicit `margin` or a wrapping flex `gap` after the swap. This
  is intentional — predictability of layout is worth the one-time
  audit.

Adoption is incremental: when Separator ships, an Alexandria PR
swaps the standalone divider call-sites discovered in the recon
above. Cards and panel borders stay until `Card` ships (next atom);
domain-specific separators stay in their bounded contexts forever.

## Card

Canonical name: **`Card`** (shadcn/ui, Radix Themes, Polaris, MUI,
Material 3 — unanimous).

Public API:

```ts
<Card variant="default | elevated | outlined">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>{children}</CardContent>
  <CardFooter>{actions}</CardFooter>
</Card>
```

Defaults: `variant="default"`. Every slot (`CardHeader`, `CardTitle`,
`CardDescription`, `CardContent`, `CardFooter`) is exported as an
individual component and can be omitted — an empty Card or a
content-only Card is equally valid.

### Why three variants

Single-variant Card (shadcn's default shape) is too thin for the
adoption story Alexandria has. The repo today carries three distinct
container patterns that need to map cleanly:

- **Subtle bordered cards** (~85 % of Alexandria's container surfaces).
  Match `variant="default"` — `--pharos-color-neutral-200` border,
  no shadow.
- **Lifted cards** with a soft shadow (modal inner surfaces, important
  callouts). Match `variant="elevated"` — `--pharos-shadow-md`, no
  border. The token is annotated in `pharos-tokens` as "Default
  elevation for cards at rest", which is exactly this case.
- **Emphasised bordered cards** that should read as more deliberate
  containers without crossing into "interactive". Match
  `variant="outlined"` — `--pharos-color-neutral-300` border, no
  shadow. The middle tier of the border-intensity hierarchy (D12).

Three variants stay well under the cardinal rule "Variants, not
sub-components" — they are three intensities of the same primitive,
not three different components.

### Why `CardHeader / Title / Description / Content / Footer` as individual exports

shadcn's Card uses the same shape and Pharos matches it for naming
parity. The slot pattern is preferable to a single `<Card>` with
prop-based content (`title`, `description`, `actions`) because:

- Consumers can **omit** any slot. A content-only Card or a Card with
  only Header is a common and natural variant — encoding it as
  optional slot props would either bloat the API surface or force
  defaults that fight specific layouts.
- Consumers can **interleave** non-slot content. Many Alexandria
  cards have a `<Separator>` between Header and Content, or two
  Content blocks separated by another piece of UI. The slot pattern
  composes naturally; props would not.
- Slot styling stays decoupled from Card's variant. Header padding,
  Title typography, Footer flex layout never change across the three
  variants — keeping them as separate components avoids needing to
  re-style for each variant.

### Why `CardTitle` is a `<div>` and not an `<h3>`

shadcn renders CardTitle as a `<div>`, leaving the document outline
(`<h2>`, `<h3>`, etc.) as the consumer's responsibility. Pharos
matches: an atom should not impose semantic heading structure when
the consumer has more context about where the card lives in the
overall heading hierarchy. If a caller needs a heading, they wrap or
spread their own `<h2>` element with the Title's class — or use the
ARIA pattern of `role="heading"` + `aria-level={N}` on the Title
itself.

`CardDescription` defaults to a `<p>` because that _is_ the
canonical semantic and consumers virtually never want it different.

### Mapping from Alexandria

Alexandria has multiple "card-like" components. The migration is
incremental:

| Alexandria pattern                                                      | Pharos equivalent                                                                                    | Notes                                                                                                                                                                                                                         |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `web-application/src/common/components/card/` (generic Card components) | `<Card variant="default">`                                                                           | Default variant covers the bordered no-shadow case which dominates Alexandria. The local generic Card components likely become thin wrappers (or get deleted) at adoption time depending on how much domain logic they carry. |
| Bespoke `<div className="bg-white border border-supporting-base ...">`  | `<Card variant="default">` (sometimes `<CardContent>` only when the wrapper is a content-only block) | A high-frequency pattern. Recon during the adoption PR identifies which call-sites need full slots vs only `<CardContent>`.                                                                                                   |
| `<div className="bg-white shadow-md ...">` (modal cards, callouts)      | `<Card variant="elevated">`                                                                          | Elevated tier. Replaces ad-hoc `shadow-md` / `shadow-sm` Tailwind utilities with the tokenised `--pharos-shadow-md`.                                                                                                          |
| Card-like containers with a more visible border                         | `<Card variant="outlined">`                                                                          | Where Alexandria deliberately darkens the border (`border-supporting-dark`, `border-grey`) for emphasis without making the surface interactive. Becomes the `neutral-300` tier.                                               |
| Domain cards (`AssessmentTemplateCard`, `RoleCard`, course cards, etc.) | stay in Alexandria, internally compose `<Card>`                                                      | Domain wrappers that carry vocabulary (status, route, action) keep their identity and just consume the Pharos primitive underneath. Same incremental pattern used for `Pill` → `Badge`.                                       |

### Deliberate divergences from Alexandria at migration time

- **Border tone normalisation**. `default` cards land at
  `neutral-200`, matching Carbon `border-subtle` / Spectrum gray-200
  / Polaris border. Most Alexandria cards already sit at
  `border-supporting-base` (≈ `neutral-200`), so the change is
  essentially tonal coherence. `outlined` cards (where Alexandria
  used `border-supporting-dark` ≈ `neutral-300`) absorb the
  intentionally stronger tier.
- **Shadow tokenisation**. Where Alexandria used `shadow-md` /
  `shadow-sm` Tailwind utilities, the elevated variant resolves
  through `--pharos-shadow-md`. The numeric values align with
  Tailwind's defaults the tokens were extracted from, so the diff is
  zero pixels at adoption time.
- **Header / Footer padding from a token grid**. Alexandria's
  bespoke `p-6 pt-4 pb-6` patterns become the consistent
  `var(--pharos-spacing-6)` rhythm across every Card. Some specific
  call-sites with tighter padding will adopt with `style` overrides
  until a reduced-padding variant proves necessary.

Adoption ships in the same Alexandria PR as Separator (single PR per
the master plan §"Estrategia"). After merge, the running app
expresses three readable border levels — subtle (separator + default
card), emphasised (outlined card), strong (interactive controls) —
and the previously-flagged "Input desentona" disonance resolves.

## IconButton

Canonical name: **`IconButton`** (Material 3, MUI, Chakra UI, Radix
Themes, IBM Carbon — unanimous among the DSes that ship a dedicated
atom). Mantine ships the same concept under the name `ActionIcon`;
shadcn / Polaris fold it into the Button / `<Button size="icon">`
pattern. Pharos goes with the dedicated atom — see "Why a dedicated
atom (and not `<Button size="icon">`)" below.

Public API:

```ts
<IconButton
  intent="primary | secondary | ghost | destructive"  // mirrors Button
  size="sm | md | lg"                                   // 32 / 40 / 48 square
  aria-label={string}                                   // required (or aria-labelledby)
  isLoading?={boolean}                                  // swaps icon for <Spinner size={size}/>
  disabled?={boolean}
  type="button | submit | reset"                        // defaults to "button"
  render?={ReactElement}                                // Base UI useRender; same as Button
>
  <Icon />  {/* Lucide icon (D4); single direct <svg> child */}
</IconButton>
```

Defaults: `intent="ghost"`, `size="md"`. The intent default differs
from Button (which defaults to `primary`) because the dominant
icon-only call-site is a low-emphasis affordance (close, dismiss,
toolbar action) — defaulting to a filled black circle would surprise
the consumer. `aria-label` (or `aria-labelledby`) is enforced at the
type level via a discriminated union: an IconButton without an
accessible name is a TypeScript error, not a runtime warning.

### Why a dedicated atom (and not `<Button size="icon">`)

The naming priority in `AGENTS.md` is shadcn > Base UI > ARIA APG.
shadcn does not ship an `IconButton` atom — its convention is
`<Button size="icon">`. Pharos still chooses a dedicated atom under
the cardinal rule "state-of-the-art > Alexandria, and where
state-of-the-art is split, weigh the consensus":

- **Six of eight** top-tier DSes ship `IconButton` (or its synonym
  `ActionIcon`) as a dedicated atom: Material 3, MUI, Chakra UI,
  Mantine, Radix Themes, IBM Carbon. Only shadcn and Polaris fold it
  into Button. The consensus is the dedicated atom.
- **Accessibility is enforceable at compile time.** `aria-label`
  becomes a required prop (discriminated union with
  `aria-labelledby`). Folded into Button via `size="icon"`, the same
  contract becomes runtime-only — Chakra emits a console warning,
  Mantine documents `VisuallyHidden`, but neither blocks a missing
  label from shipping. WCAG 4.1.2 compliance moves from "remember to
  pass it" to "the type system blocks the build".
- **Semantic constraints differ.** IconButton is **square** (width
  = height), Button is rectangular with text-based padding. Folding
  `size="icon"` into the Button axis would force every Button size
  variant to optionally override its layout — more API surface for
  the same component, with no win.
- **shadcn's choice optimises for Tailwind utility-first authoring.**
  Adding a `size="icon"` variant in Tailwind is one extra CVA entry
  with `size-10 p-0`. In CSS Modules the cost of a separate atom is
  zero — duplicated CSS is essentially the Button rules minus padding,
  plus a `> svg` size rule. The ergonomic argument that pulls shadcn
  toward `size="icon"` does not apply to Pharos.

The dedicated-atom decision is registered as **D13 (2026-04-30)**.

### Why mirror Button's `intent` axis (and not Material's "filled / tonal / outlined / standard")

Material 3's IconButton exposes four visual variants: `Standard`,
`Filled`, `Filled Tonal`, `Outlined`. MUI extends with a `color` axis
on top. Chakra exposes six variants × eight sizes. The combinatorial
surface area is large because those DSes treat IconButton as an
independent thing.

Pharos consolidates: `intent` is the same prop with the same four
values as Button (`primary | secondary | ghost | destructive`), and
the visual treatment is an implementation detail of each intent. Reading
across the system stays one-axis: every interactive control answers
the question "what does this action mean?" with the same vocabulary.
The mapping is exact — `primary` is filled neutral-900, `secondary`
is bordered (the Material `Outlined` equivalent), `ghost` is
transparent (the Material `Standard` equivalent), `destructive` is
filled red. No tonal tier; if a low-emphasis filled variant becomes
necessary, it lands as a fifth intent rather than a second axis.

### Why `rounded-full` (circle)

Square dimensions plus `border-radius: var(--pharos-radius-full)`
yields a perfect circle. The choice matches:

- **Material 3** Standard / Filled / Filled Tonal IconButtons (default
  shape is circular).
- **MUI** IconButton (default shape is circular).
- **Mantine** ActionIcon (default `radius: "xl"` ≈ circular).
- **Alexandria's existing wrappers**: `CloseButtonCircle`,
  `NextCircleButton`, `PreviousCircleButton` are already circular.

Square / rounded-rectangle IconButtons exist (Carbon, Polaris-style
toolbars), but the circle is the dominant convention in modern DSes
and matches the Pharos-wide pill language: Button is fully rounded,
Badge is fully rounded, IconButton inherits the same `--pharos-radius-full`
token. Internal coherence over per-atom shape exploration.

### Why `sm / md / lg = 32 / 40 / 48 px` square

Heights match Button's grid exactly via `--pharos-spacing-8 / 10 / 12`.
An IconButton next to a Button of the same size sits flush — same
height, same vertical centre. The icon SVG inside scales 16 / 20 / 24
(via `--pharos-spacing-4 / 5 / 6`), matching Spinner's size grid so
`<IconButton isLoading>` keeps the visual diameter identical to the
resting icon state.

The `> svg` direct-child selector sizes Lucide icons that ship with
hardcoded `width="24" height="24"`. The selector is direct-child on
purpose: Spinner renders `<span><svg/></span>`, so the rule does not
double-size its inner SVG. Consumers wrapping an icon in a custom
component remain responsible for sizing it — same contract shadcn
documents on its `[&_svg]:size-X` pattern.

### Why `isLoading` lives on the atom (and Button's does not)

Button does **not** ship an `isLoading` prop today; the documented
composition for a loading Button is `<Button disabled><Spinner /><span>Saving</span></Button>`
(see `Spinner.stories.tsx` "InsideButton"). The same composition
works for IconButton, but the icon-only case is materially worse
without an `isLoading` shorthand:

- The consumer has to **swap** the icon for the Spinner conditionally
  (icon while idle, Spinner while loading), which means two render
  branches inside the JSX of every async icon button.
- The accessible name needs the same treatment: aria-label="Saving…"
  vs aria-label="Save" depending on state.

By wiring `isLoading` into the atom: the consumer keeps a single
`children={<Icon />}`, the atom swaps the slot, sets `disabled`,
exposes `aria-busy="true"`, and the consumer's call-site stays one-shape
across loading and resting states. The Spinner already shipped
(`0.9.0`); the cost of consuming it from inside IconButton is zero
(no new dependency, no new CSS).

Button stays without `isLoading` for now because Alexandria's
`AsyncLoadingButton` wrappers compose the loading state at the
domain layer. If a future Button consumer pattern justifies it, it
gets added then under the same Spinner-swap contract.

### Why no integrated `Tooltip`

IBM Carbon mandates an integrated tooltip on IconButton ("a tooltip
is always required with text explaining what the icon button would
do if clicked"). Pharos diverges: Tooltip is a separate atom (not yet
shipped). Reasoning:

- `aria-label` already satisfies WCAG 4.1.2 (Name, Role, Value) —
  the tooltip on hover is a UX nicety, not an accessibility
  requirement.
- Coupling Tooltip into IconButton imports the entire Tooltip
  positioning runtime for every IconButton call-site, even those
  that do not need a tooltip (close button on a modal already
  labelled "Close" by context).
- Composition stays explicit: the consumer wraps `<Tooltip><IconButton/></Tooltip>`
  when they want the hover affordance. Same pattern shadcn / Radix
  Themes / Mantine document.

### Why no `selected` / toggle state in v1

Material 3 adds `selected` to IconButton for toggle UX (favorite,
mute, pin). Pharos defers it: no Alexandria call-site exercises the
toggle pattern today, and adding it pre-emptively is designing for a
hypothetical future requirement. Adding it later is non-breaking —
the `selected` prop is additive.

### Mapping from Alexandria

The IconButton release pairs with an Alexandria adoption PR that
collapses the icon-only button family.

| Alexandria component                        | Pharos equivalent                                                         | Notes                                                                                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `CloseButton`                               | `<IconButton intent="ghost" aria-label="Close"><X/></IconButton>`         | Inline X icon in a transparent surface — the most common close-affordance shape.                                                    |
| `CloseButtonCircle`                         | `<IconButton intent="secondary" aria-label="Close"><X/></IconButton>`     | Bordered circle (`neutral-500` border via D10). Distinguishes from `CloseButton` by carrying its own visible boundary on the page.  |
| `NextCircleButton` / `PreviousCircleButton` | `<IconButton intent="secondary" aria-label="..."><Chevron/></IconButton>` | Navigation pair — same bordered chrome. `render={<Link to="..."/>}` when the navigation goes through a router.                      |
| `AsyncLoadingButton` (icon-only call-sites) | `<IconButton isLoading={...} aria-label="..."><Icon/></IconButton>`       | The loading-icon-button case folds into the atom's built-in `isLoading`. Composite call-sites that mix label + icon stay on Button. |

### Deliberate divergences from Alexandria at migration time

- **`aria-label` becomes mandatory at the type level.** Alexandria's
  wrappers accept optional `aria-label` and rely on convention. The
  Pharos atom errors at compile time without one. Adoption PRs add
  the label where missing — most call-sites already pass it; the
  audit catches the rest.
- **Border tone normalises to `neutral-500` for `secondary`.**
  Alexandria's circle buttons border at `neutral-300` /
  `border-supporting-base`. Pharos lifts them to the WCAG 1.4.11
  strong-tier (~5.4:1 vs white) so an IconButton border reads as
  deliberately the focal interactive element on the page — the same
  shift Input / Button-secondary / Badge-outline already absorbed in
  earlier adoption PRs.
- **Heights move to the 8px grid (32 / 40 / 48 px).** Alexandria's
  circle buttons sit at one-off pixel sizes (`w-[32px]`,
  `w-[44px]`). Pharos absorbs them into the standard scale — the
  ≤2px deltas are imperceptible and the grid alignment pays off
  next to other controls.

Adoption is incremental: when this IconButton ships to npm, an
Alexandria PR replaces every `CloseButton` / `CloseButtonCircle` /
`Next/PreviousCircleButton` instance with the mappings above. The
async-loading icon-button cluster (`AsyncLoadingButton` /
`PublishButton` / `UnpublishButton` / `AddButton`) folds into the
atom's `isLoading` in the same PR or the next, depending on how much
state-ownership refactor each call-site needs. Cases that require
JSX-tree restructuring beyond the swap stay deferred to Phase 6.

## Avatar (D14, 2026-05-11)

Compound atom composed of `Avatar` (root), `AvatarImage`,
`AvatarFallback`, and `AvatarGroup`. State-of-the-art validation
ahead of the decision showed Avatar as a dedicated atom in 8 of 10
top-tier DS — shadcn / Radix Primitives / Base UI / MUI / Chakra /
Mantine / Ant Design / Polaris — and the two that do not ship it in
core (Material 3, Carbon) delegate to their implementer library
(MUI, `@carbon/ibm-products`) which does. The cardinal-rule bar (6/8)
clears easily, so Avatar becomes a Pharos atom and Alexandria's
existing patterns (15+ `<Image rounded-full>` call-sites,
`AvatarList`, `PeopleList`, `PersonView`, `UserAvatar`,
`ProfileSummary`) adopt it.

### Why a compound, not a flat component

The flat shape (MUI / Polaris / Ant Design) bakes a `name` prop, a
`children` slot for icons, and a `src` prop into a single component,
then implements the fallback chain (image → initials → icon)
internally. The compound shape (shadcn / Radix / Base UI / Chakra)
exposes `Image` and `Fallback` as discrete parts so the consumer
composes the fallback content (text, icon, default PNG) directly.
Pharos picks the compound shape for three reasons:

1. **Same composition principle as the form-control atoms (D11).**
   Input and Textarea do not bake `helperText` or `error` slots —
   the consumer composes label + message externally. Avatar treating
   `Fallback` the same way keeps the atom set internally consistent.
2. **No naming heuristics inside the atom.** A `name` prop that
   derives initials would have to decide what to do with "María del
   Carmen Pérez García" (4 tokens? 2? first + last?), with empty
   names, with single-word labels. Pushing initial computation to the
   consumer side keeps the atom free of policy.
3. **Composition is non-breaking.** A future "default user
   silhouette" can ship as an exported icon the consumer drops into
   `AvatarFallback`. The atom never has to renegotiate which
   placeholder is "the default".

### Sizes: 3 named + numeric escape

Named sizes match the IconButton / Button height grid:

| Size | Width / Height | Initials font-size | Group overlap (negative margin) |
| ---- | -------------- | ------------------ | ------------------------------- |
| `sm` | 32 px          | 12 px              | -6 px                           |
| `md` | 40 px          | 14 px              | -8 px                           |
| `lg` | 48 px          | 16 px              | -10 px                          |

`size={number}` writes `width` / `height` inline for one-off cases
(profile-picture 108 px in `ProfileSummary` / `UserProfileBox`;
compact 20 px stacks in `AvatarList`). The numeric path skips the
size CSS class, so the `> svg` icon auto-sizing rule does not apply
— numeric Avatars rely on the consumer for icon dimensions, the same
tradeoff Mantine / Ant Design document for their `size={number}`
escape.

### Shape: circle default, square for orgs / products

Two shapes. Circle (default) clips to a perfect circle via
`border-radius: full`; square uses the `radius-md` token so an org or
product avatar harmonises with the Card corner family on the same
surface. Alexandria's `request-access/page.tsx` (100 px org logo) is
the canonical square use-case.

The breakpoint-conditional shape Alexandria's `AvatarList` and
`PeopleList` ship today (`rounded-full` on mobile, `rounded-cs-md`
on `xl`) does **not** become an atom feature — it is a consumer-side
visual choice the wrapper applies after adoption. The atom exposes
the two shapes; consumers branch on breakpoints if they need that
divergence.

### AvatarGroup ships in v1 because Alexandria already stacks avatars

Initial reading of state-of-the-art (5 of 8 DS expose
`AvatarGroup` — MUI, Chakra, Mantine, Ant Design, shadcn extended)
suggested deferring the group to v2 as additive. The Alexandria
audit reversed that: `AvatarList` and `PeopleList` already render
stacks with negative margin, z-index, and "+N" overflow badge.
Shipping Avatar without `AvatarGroup` would force those wrappers
to re-implement stack mechanics around an atom that does not
understand them. v1 includes the group.

Group features in v1:

- `max` caps visible avatars; the surplus collapses into a final
  `+N` Avatar with accessible name `{N} more`.
- `size` / `shape` cascade to Avatar children that omit those props
  (consumer can override per-Avatar if needed).
- Stacking uses `--pharos-avatar-overlap` (set by the size class) so
  negative margin scales with the avatar diameter.
- The ring around stacked avatars is a `box-shadow`, not a
  `border` — `--pharos-avatar-group-ring` defaults to the page's
  `base-white`; consumers on a tinted surface override the variable
  inline.

The group does not expose `total` / `renderSurplus` props in v1.
Adding them is additive when a call-site emerges (e.g. an
"and 12 more" tooltip on the overflow badge); until then, the
default `+N` suffices for every Alexandria stack audited.

### What v1 deliberately leaves out

- **No status badge primitive.** Material 3 / shadcn extended /
  Chakra all wire a status badge (online / busy / DND) on top of
  the avatar. Pharos defers it: no Alexandria call-site exercises
  the status indicator today. When it appears, the path is
  composition (Avatar + a Badge primitive with positioning support)
  rather than a coupled `AvatarBadge` slot.
- **No `name` → initials prop.** Composition stays explicit (see
  the rationale above).
- **No color / variant axis.** Mantine offers a
  `color="initials"` mode that derives a background tint from the
  name. Pharos keeps a single neutral surface for the fallback —
  same minimal palette shadcn / Radix / Polaris ship. Consumers
  that want a per-user tint pass `style={{ background: ... }}` on
  the Avatar root or the Fallback.

### Mapping from Alexandria

The Avatar release pairs with a future adoption PR in
`alexandria-web-application` covering the people-rendering surface.

| Alexandria component / pattern                                                                                       | Pharos equivalent                                                                                  | Notes                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `common/components/people/AvatarList.tsx` (overlapping mini-stack, 20 px)                                            | `<AvatarGroup size={20} max={N}>` with `<Avatar><AvatarImage/><AvatarFallback/></Avatar>` children | Numeric `size={20}` keeps the 5-per-row compact stack. The wrapper continues to expose the `AvatarList` API while delegating to Pharos internally.  |
| `common/components/people/PeopleList.tsx` (overlapping list, 32 px)                                                  | `<AvatarGroup size="sm" max={N}>`                                                                  | Drop-in stack; the existing border on overlapped items is replaced by the Pharos `box-shadow` ring.                                                 |
| `common/components/people/PersonView.tsx`                                                                            | `<Avatar size="sm" shape={overrideShape}>` with composition                                        | Tooltip + name + description stay in the wrapper. The breakpoint-conditional `rounded-cs-md` becomes a consumer-side choice via `shape`.            |
| `dashboard-layout-components/UserMenu.tsx`, `MobileHeader.tsx`                                                       | `<Avatar size="md">`                                                                               | 40 px header identity. `MobileHeader`'s initials-when-no-image fallback collapses naturally into `<AvatarFallback>{firstName[0]}</AvatarFallback>`. |
| `user-management/UserManagementComponents/UserAvatar.tsx`                                                            | `<Avatar size={36}>`                                                                               | Numeric escape for the 36 px legacy size. The wrapper stays for the row layout; only the photo slot moves to Pharos.                                |
| `user-management/ProfileSummary.tsx`, `dashboard/UserProfile/UserProfileBox.tsx`                                     | `<Avatar size={108}>` / `<Avatar size={56}>`                                                       | Numeric escape for profile-picture sizes.                                                                                                           |
| Assessment headers / tables (`AssessmentReportHeader`, `RevieweeTable`, `ForkedAssessmentCard`, `ModifyRevieweeRow`) | `<Avatar size="sm">` / `<Avatar size="md">`                                                        | 32 / 40 / 44 px → snap to `sm` / `md`. The 44 px outlier in `ForkedAssessmentCard` rounds to `md` (40 px); the ≤4 px delta is imperceptible.        |
| `teams/TeamMembers.tsx`                                                                                              | `<Avatar size="md">`                                                                               | 40 px member link card.                                                                                                                             |
| `request-access/page.tsx` (org logo 100 px / owner 40 px)                                                            | `<Avatar size={100} shape="square">` / `<Avatar size="md">`                                        | The org logo justifies `shape="square"` — non-person entity.                                                                                        |

### Deliberate divergences from Alexandria at migration time

- **Breakpoint-conditional shape becomes consumer-side.** Pharos
  does not bake a `mobile: circle, desktop: square` switch into the
  atom. Wrappers that want that behaviour branch on a media query
  and pass `shape` accordingly — the same way shadcn / Radix avatars
  leave breakpoint shape decisions to the consumer.
- **Stack ring replaces `border-light-grey border-[0.4px]`.** The
  Pharos `box-shadow` ring renders identically without the
  off-by-fraction width. Stacks read as cleanly separated silhouettes
  on every surface.
- **Initials path becomes explicit.** Alexandria's
  `MobileHeader.tsx` is the only call-site shipping an initials
  fallback today (every other surface falls back to a
  `user-avatar.png` placeholder). The atom does not derive initials
  automatically — when an adoption PR wants the initials path, it
  calls a tiny consumer helper inside `<AvatarFallback>`.

Adoption is incremental: when this Avatar ships to npm, a single
Alexandria PR can swap `AvatarList`, `PeopleList`, `PersonView`,
`UserAvatar`, header / menu identity, assessment tables, and the
team / access surfaces one bounded context per wave. The
profile-summary / user-profile-box pair sits in its own wave because
it carries the numeric escape (108 px) and benefits from a focused
visual review.

## DropdownMenu (D15, 2026-06-12)

Action menu anchored to a trigger. Wraps Base UI's `Menu.*` parts,
which implement the ARIA APG **menu-button** pattern: `role="menu"` /
`menuitem`, roving focus, arrow-key navigation, typeahead, and
Escape-to-close with focus return to the trigger.

### Why a separate atom from Popover (and not one configurable overlay)

A cross-DS survey ahead of the decision showed **7 of 8 top-tier design
systems expose Popover and DropdownMenu/Menu as separate public atoms**
— shadcn, Radix, Base UI, MUI, Chakra, Mantine, Ant Design all separate
them; only Polaris composes (and polaris-react is deprecated). The
reason is an accessibility contract that does not merge:

- **DropdownMenu** = menu-button (APG): `role="menu"` / `menuitem`,
  roving focus, arrow keys, typeahead, Escape. For **commands**.
- **Popover** = disclosure/dialog (APG): Tab navigates inside, no menu
  roles. For **free-form anchored content** (forms, navigation links).

Putting `role="menu"` around arbitrary content breaks screen-reader
expectations, so a single "configurable overlay" cannot satisfy both.
Base UI mirrors this split exactly (`Menu.*` vs `Popover.*`), so Pharos
wraps the matching primitive per atom. D15 ships `DropdownMenu`; a
`Popover` atom is deferred to its own decision (no consumer needs it
until the MobileHeader user panel is adopted).

### Why shadcn naming (`DropdownMenu`, not Base UI's `Menu`)

Canonical-naming order (shadcn > Base UI > ARIA APG) puts shadcn's
`DropdownMenu` first. The compound parts follow shadcn too:
`DropdownMenuTrigger / Content / Item / Separator / Label / Group`. The
`Content` part collapses Base UI's `Portal` + `Positioner` + `Popup`
into one element exposing `side` / `align` / `sideOffset` — the same
ergonomic shadcn applies over Radix's three-part positioner.

### What v1 deliberately leaves out

- **No `CheckboxItem` / `RadioItem`.** No Alexandria call-site selects
  state from a menu today (the LanguageSelector is a Listbox → future
  `Select` atom, not a menu). Additive when a call-site appears.
- **No submenus (`SubmenuRoot` / `SubmenuTrigger`).** No nested menus
  in the audit.
- **No `LinkItem`.** Navigation-as-menu-item is not exercised; a row
  that navigates can pass `render` on a plain `Item` if needed.
- **No `z-index` token.** Base UI renders through a Portal appended to
  `<body>`, so the popup stacks above in-flow content without one. A
  `--pharos-z-index-*` scale is a known follow-up for when overlapping
  overlays (Popover, Sheet) land.

### `destructive` item variant

`DropdownMenuItem` carries a `variant: 'default' | 'destructive'` axis
(shadcn ships the same). Alexandria has several delete / remove actions
(`ManageCareerLadderMenu` delete, `LessonCardContextMenu` delete,
`RemoveBox`) that map onto it; the destructive row uses the error
foreground that darkens on highlight, matching the destructive Button.

### Mapping from Alexandria

The DropdownMenu release pairs with a future adoption PR covering the
28 overlay touchpoints the audit found. Alexandria centralises them in
a generic `ContextMenu.tsx` wrapper (kebab `MoreIcon` + `@headlessui`
Popover, manual repositioning, `z-index: 9999`).

| Alexandria component / pattern                                                                 | Pharos equivalent                                                                                | Notes                                                                                                                       |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `common/components/ContextMenu.tsx` (kebab trigger + action slots) — 14 call-sites             | `<DropdownMenu>` + `<DropdownMenuTrigger render={<IconButton><MoreIcon/></IconButton>}>` + items | The kebab trigger composes the IconButton (D13) via `render`. Each action becomes a `<DropdownMenuItem>`.                   |
| `common/components/PopoverPanel.tsx` (manual repositioning base)                               | Deleted at adoption — Base UI's Positioner replaces the manual `getBoundingClientRect` logic     | The `z-index: 9999` and overflow-detection quirks go away; Base UI handles collision avoidance.                             |
| delete / remove actions inside ContextMenu (`ManageCareerLadderMenu`, `LessonCardContextMenu`) | `<DropdownMenuItem variant="destructive">`                                                       | The destructive tone replaces ad-hoc red styling.                                                                           |
| `MobileHeader.tsx` user panel (avatar → identity + LanguageSelector + logout)                  | Deferred to a `Popover` atom                                                                     | Free-form content (embedded LanguageSelector navigation), not a command menu — disclosure/dialog contract, not menu-button. |
| `LanguageSelector`, `Select`, `SearchSelect` (Listbox)                                         | Future `Select` / `Combobox` atom                                                                | Not a menu — selection control. Out of D15 scope.                                                                           |

### Deliberate divergences from Alexandria at migration time

- **`role="menu"` semantics replace a styled Popover.** Alexandria's
  ContextMenu is a `@headlessui` Popover with buttons inside — no menu
  roles, no roving focus, no typeahead. The Pharos DropdownMenu brings
  the full menu-button keyboard contract. This is a deliberate
  accessibility upgrade, not a visual-only swap.
- **Base UI Positioner replaces manual repositioning.** The
  `PopoverPanel` `getBoundingClientRect` + `requestAnimationFrame`
  overflow logic and the `z-index: 9999` are dropped in favour of Base
  UI's collision avoidance.

## Popover (D16, 2026-06-12)

Free-form content anchored to a trigger. Wraps Base UI's `Popover.*`
parts, which implement the ARIA **dialog** pattern as a **non-modal**
disclosure: `role="dialog"` on the popup, focus moves into it on open
and returns to the trigger on close, Escape and outside-click dismiss
it, and focus is NOT trapped (the rest of the page stays interactive).

This is the sibling D15 deferred. The two atoms are intentionally
distinct and share no machinery — D15 wraps `Menu.*` (menu-button), D16
wraps `Popover.*` (disclosure/dialog). See the D15 § "Why a separate
atom from Popover" for the cross-DS evidence (7 of 8 top-tier DSs
separate them).

### Cross-DS survey (what shaped the API)

A survey ahead of the decision confirmed the naming and the part list:

- **Naming.** Everyone except MUI converges on `Trigger` + a content
  surface. shadcn calls the surface `Content`; Pharos already chose
  `Content` for DropdownMenu, so D16 keeps it. The positioning
  vocabulary `side` / `align` / `sideOffset` / `alignOffset` is shared
  verbatim by shadcn, Radix and Base UI — adopted unchanged. (React
  Aria's `placement`/`offset` and MUI's `anchorOrigin` are the minority
  and do not win the canonical-naming order.)
- **Minimal anatomy.** `Root` + `Trigger` + `Content` is the universal
  floor (shadcn, Mantine, every DS). `Close` (Radix + Base UI ship it)
  and `Title` / `Description` (Base UI ships them; shadcn added
  `PopoverTitle`/`PopoverDescription`) are cheap, high-value extras that
  reinforce the dialog-labelling contract, so v1 includes them.
- **Non-modal default.** Base UI, Radix and shadcn all default Popover
  to non-modal. D16 matches (`modal` defaults to `false`). React Aria's
  modal-by-default is the outlier.

### Why shadcn naming (`Popover`, not Base UI's parts)

Canonical-naming order (shadcn > Base UI > ARIA APG) puts shadcn's
`Popover*` first: `PopoverTrigger / Content / Title / Description /
Close`. `PopoverContent` collapses Base UI's `Portal` + `Positioner` +
`Popup` into one element exposing `side` / `align` / `sideOffset` /
`alignOffset` — the same ergonomic the DropdownMenu applies, plus
`alignOffset` (a popover's free-form content benefits from cross-axis
nudging more than a menu does).

### `align` defaults to `center` (not `start` like DropdownMenu)

A menu opens flush to the trigger's start edge, so `DropdownMenuContent`
defaults `align="start"`. A popover carries arbitrary content and reads
better centred on the trigger — the shadcn / Radix / Base UI default.
`PopoverContent` therefore defaults `align="center"`. `side` (`bottom`)
and `sideOffset` (`8`) match DropdownMenu for surface-family
consistency.

### What v1 deliberately leaves out

- **No `PopoverArrow`.** Base UI ships `Popover.Arrow`; no Alexandria
  call-site needs a pointer today. Additive without a breaking change.
- **No non-trigger `PopoverAnchor`.** Anchoring the popup to an element
  other than the trigger (Radix `Anchor` / Base UI's `anchor` prop) is
  what a future Combobox will want for its input field — deferred until
  that atom lands.
- **No modal `Backdrop` / `Viewport`.** The known consumers are all
  non-modal; a modal Popover or multi-content transition is additive.
- **No `z-index` token.** Same as DropdownMenu — Base UI portals to
  `<body>`, so the popup stacks above in-flow content without one. The
  shared `--pharos-z-index-*` scale remains the follow-up for when
  overlays must stack over each other.

### Mapping from Alexandria

The Popover release pairs with a future adoption PR. The audit ahead of
the decision found `@headlessui/react` is **not** retired by this atom —
it remains pervasive (Listbox ×5, Combobox ×1, Disclosure ×10, Dialog
×15, Tab, Switch). Popover retires only the headlessui **Popover**
usage: the 3 call-sites below. (This corrects the D15 mapping note,
which optimistically listed `PopoverPanel.tsx` under DropdownMenu —
`PopoverPanel` is a disclosure wrapper holding forms, so it belongs to
this atom, not the menu one.)

| Alexandria component / pattern                                                       | Pharos equivalent                                                                   | Notes                                                                                                                                                             |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `common/components/PopoverPanel.tsx` (headlessui `Popover` + manual repositioning)   | `<Popover>` + `<PopoverTrigger>` + `<PopoverContent>`                               | The `getBoundingClientRect` + `requestAnimationFrame` overflow logic and any `z-index` go away — Base UI's Positioner handles collision avoidance.                |
| `layout/MobileHeader.tsx` user panel (avatar → identity + LanguageSelector + logout) | `<PopoverTrigger render={<IconButton><Avatar/></IconButton>}>` + `<PopoverContent>` | Uses headlessui `Popover` directly (not the wrapper). Free-form content (embedded LanguageSelector navigation) — the disclosure/dialog contract is exactly right. |
| `career-ladders/roles/AddUsers/AddUsers.tsx` + `dashboard/.../AddSkills.tsx`         | `<Popover>` with the add-form as `<PopoverContent>` children                        | Both render a small form in the panel via `PopoverPanel` — the canonical Popover case (arbitrary content, not commands).                                          |

### Deliberate divergences from Alexandria at migration time

- **`role="dialog"` semantics + focus management.** Alexandria's
  `PopoverPanel` is a headlessui `Popover` with manual positioning and
  no explicit dialog labelling. The Pharos Popover brings the disclosure
  contract (focus into the popup on open, return to trigger on close,
  `aria-labelledby` via `PopoverTitle`) — an accessibility upgrade, not
  a visual-only swap.
- **Base UI Positioner replaces manual repositioning.** Same as
  DropdownMenu: the `getBoundingClientRect` + `requestAnimationFrame`
  overflow logic and hard-coded `z-index` are dropped for Base UI's
  collision avoidance.
- **e2e selector caveat (inverse of the menu migration).** Migrating a
  menu turned items into `role="menuitem"` and broke specs. A Popover
  does the opposite: its content is NOT turned into menuitems and the
  popup is a `role="dialog"`. Specs written against these call-sites
  must assert the dialog/disclosure contract, not the menu one.

## Select + Combobox (D17, 2026-06-12)

The selection family: **two atoms, split by interaction contract.**
`Select` wraps Base UI's `Select.*` (the ARIA **listbox** pattern — a
trigger button opens a `role="listbox"` of `role="option"` rows, no text
input). `Combobox` wraps Base UI's `Combobox.*` (the APG **combobox**
pattern — an `<input role="combobox">` that filters a popup listbox).
Multi-select is a `multiple` axis on each root, **not** a third atom.

### Cross-DS survey (what shaped the "two atoms, not one or three")

A survey of shadcn, Base UI, Radix, React Aria, Ant Design, Mantine and
MUI ahead of the decision found the modern/headless tier has converged:

- **Two components, split by contract.** shadcn ships `Select` +
  `Combobox`; Base UI ships `Select` + `Combobox` (+ `Autocomplete`);
  Radix ships `Select` (no combobox primitive); React Aria ships
  `Select` + `ComboBox`. ARIA APG defines the listbox and combobox
  patterns separately. **shadcn, Base UI and APG agree on the two names
  `Select` and `Combobox`** — maximum naming consensus, so Pharos ships
  two atoms rather than Ant/MUI's "one component with a `searchable`
  axis" (which fuses the listbox and combobox a11y contracts and reads
  worse to screen readers).
- **Multi-select is an axis, not an atom.** Base UI, shadcn, Radix-intent
  and React Aria all model multi-select as `multiple` /
  `selectionMode="multiple"` on the same component, not a separate
  `MultiSelect`. Only Mantine promotes `MultiSelect` / `TagsInput` to
  named components, and those are thin wrappers over one engine. Pharos
  follows the majority: `multiple` on `Select.Root` / `Combobox.Root`.
- **Free-text is the one place a 3rd atom could be justified** — typing a
  value that is _not_ in the list (Base UI's `Autocomplete`, Mantine's
  `TagsInput`). No known Alexandria call-site does this (every picker
  filters a known set), so `Autocomplete` is deferred; the split-by-
  contract precedent makes it additive when a free-text case appears.

### Naming

- **Select** follows shadcn (`Select / SelectTrigger / SelectValue /
SelectContent / SelectItem / SelectGroup / SelectLabel /
SelectSeparator`). `SelectTrigger` folds Base UI's `Trigger` + the
  chevron `Icon`; `SelectContent` collapses `Portal` + `Positioner` +
  `Popup` + `List` (the same `side` / `align` / `sideOffset` /
  `alignOffset` vocabulary as DropdownMenu/Popover); `SelectItem` folds
  `Item` + `ItemText` + the selected-state `ItemIndicator`. `SelectLabel`
  maps to Base UI's `GroupLabel` (parallel to `DropdownMenuLabel` →
  `Menu.GroupLabel`).
- **Combobox** follows Base UI (`Combobox*`; shadcn has no canonical
  primitive — it composes a Popover+Command recipe, so it does not win
  the naming order for the parts). A combobox is inherently more
  compositional than a select, so its chrome stays split: `ComboboxControl`
  (single, wraps `InputGroup`) / `ComboboxChips` (multiple, wraps `Chips`)
  own the bordered box; `ComboboxInput` is the bare field (wraps `Input`,
  `role="combobox"`); `ComboboxTrigger` the chevron; `ComboboxClear` the
  clear button; `ComboboxChip` / `ComboboxChipRemove` the selection chips.
  `ComboboxContent` collapses `Portal` + `Positioner` + `Popup`, with
  `ComboboxList` (accepts a `(item, index) => ReactNode` render function
  over the filtered `items`) and `ComboboxEmpty` inside it.

### Shared with the rest of the form-control family

- **Escuela 1 (D11).** Neither atom owns label / helper / error message.
  The consumer composes those; error state is the standard `aria-invalid`
  attribute (the CSS reacts to `[aria-invalid="true"]` on the trigger /
  control). Same rule as Input, Textarea.
- **Input chrome + size grid.** The Select trigger and the Combobox
  control share Input's chrome: `neutral-500` resting border (D10, WCAG
  1.4.11 — these are interactive control boundaries), brand focus ring,
  and the `sm`/`md`/`lg` height grid that matches Input and Button so a
  selection control sits flush on a mixed form row.
- **Anchor-width.** Both popups take `min-width: var(--anchor-width)` and
  `max-height: var(--available-height)` from Base UI's Positioner (the
  CSS vars are identical across `Select` and `Combobox`). The popup is
  never narrower than the control. **This is the affordance Popover v1
  lacked — the reason AddUsers/AddSkills were deferred to this atom.**
- **Surface family + no `z-index` token.** The popup surface (white,
  `neutral-200` border, `shadow-lg`, fade-and-scale motion) is identical
  to DropdownMenu and Popover. Base UI portals to `<body>`, so no
  `z-index` is set — same `--pharos-z-index-*` follow-up the other
  overlays carry.

### Close-on-select

Single-select closes the popup on pick; multi-select keeps it open so
selections accumulate. Base UI derives this from `multiple` and Pharos
does not override it — matching shadcn, Base UI and React Aria. No
`closeOnSelect` prop in v1.

### What v1 deliberately leaves out (additive, non-breaking)

- **`Autocomplete` (free-text entry).** Base UI's separate primitive; no
  Alexandria call-site types values outside the option set. Deferred.
- **`Arrow`, `Backdrop`, scroll-arrows (`ScrollUpArrow`/`ScrollDownArrow`),
  `Collection`/`Row` virtualization, `Status`.** No current call-site
  needs them; all additive via the compound API.
- **A bundled `<Field>` molecule.** Label + message composition is the
  future `Field` molecule (D11), not these atoms.

### Mapping from Alexandria

The release pairs with a future adoption PR (Alexandria is paused). The
audit ahead of the decision split the call-sites cleanly by contract:

| Alexandria component / pattern                                                                                  | Pharos equivalent                                           | Notes                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `common/components/form/Select/Select.tsx` (headlessui `Listbox`, single; trigger-width via `ResizeObserver`)   | `<Select>` + `SelectTrigger` + `SelectContent`              | Call-sites: `CategorySelector`, `CourseForm` visibility, `EditableLessonCardHeader`. `ResizeObserver` width logic → `--anchor-width`. |
| `common/components/SearchSelect.tsx` (headlessui `Combobox`, single + filter)                                   | `<Combobox>` (single) + `ComboboxControl` + `ComboboxInput` | Call-site: `NoLinkedEntityNodeContent` (graphs). The `zoomFactor` width hack is reconsidered against `--anchor-width` at adoption.    |
| `PlatformRoleSelector`, `TagSelector` (SearchSelect rendered N times to accumulate)                             | `<Combobox multiple>` with `ComboboxChips`                  | The "render the picker once per selected value" pattern collapses into the native `multiple` chips contract.                          |
| **`AddUsers` (desktop) + `AddSkills`** (headlessui `PopoverPanel` + custom checkbox/search list, close-on-save) | `<Combobox multiple>` (chips) + `ComboboxContent`           | **The pickers deferred from Popover (D16).** Native `multiple` + filtering + `--anchor-width` replace the hand-rolled panel.          |
| `LanguageSelector` (headlessui `Listbox`, `dropdown`/`collapsed` variants)                                      | `<Select>`                                                  | The `inline` variant is a `radiogroup`, not a select — stays as-is. The dropdown/collapsed variants map to Select.                    |
| `ActionForm` priority (Listbox, custom `PriorityBadge` trigger), `TeamFilters` (Listbox, `width` prop)          | `<Select>` (custom `SelectValue` render)                    | Single-selects with a custom-rendered value — `SelectValue` accepts a render function.                                                |

### Deliberate divergences from Alexandria at migration time

- **`role="listbox"`/`option` (Select) and `role="combobox"` (Combobox)
  replace headlessui's roles + manual `ResizeObserver`/`zoomFactor`
  width and manual repositioning.** Base UI's Positioner handles
  collision avoidance and `--anchor-width`.
- **e2e selector caveat (same lesson as the menu migration).** Migrating
  these pickers changes the trigger's accessible name and the option
  roles — `input[role="combobox"]` stays for Combobox but the Select
  trigger becomes a `role="combobox"` button (Base UI), and option rows
  stay `role="option"`. Audit `create-course` / `edit-course` /
  `edit-course-lessons` specs (they use `getByLabel("Category *")`,
  `getByRole("option")`, `input[role="combobox"]`) at adoption time.
- **`PopoverPanel.tsx` retires here.** Once AddUsers/AddSkills move to
  `Combobox multiple`, the headlessui `PopoverPanel` wrapper they kept
  alive (deferred from D16) has no consumers and is deleted.
