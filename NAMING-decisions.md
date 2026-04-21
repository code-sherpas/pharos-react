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
| `NewButton variant="filled" tone="default"` (navy-filled)   | `<Button intent="primary">` — navy → **brand blue** (deliberate, see below)                        |
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

### Deliberate visual changes at migration time

These are cases where Pharos intentionally diverges from Alexandria's
current look because following the design-system best practice is
worth the one-time visual shift:

- **`filled=navy-blue-text` → `intent="primary"` (brand blue)**.
  Alexandria's `NewButton variant="filled" tone="default"` renders with
  `bg-navy-blue-text` (neutral-900, near-black). Pharos `primary` is
  the brand's canonical CTA color — `primary-600` = `#2a48e9`, the
  sea-blue primitive. Using a neutral as the brand intent is an
  implementation quirk of Alexandria that would confuse any DS
  consumer (tenant skinning, dark mode, future brand refresh). At
  migration, every filled-default button switches from navy to brand
  blue. This is **the DS deciding what "primary" means**, not Alexandria
  preserving an implementation detail.

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
