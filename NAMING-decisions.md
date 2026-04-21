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
`feat/fase-0-analysis`). They collapse into the Pharos `Button` as follows:

| Alexandria component                 | Pharos equivalent                                                                                  |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `PrimaryButton`                      | `<Button intent="primary">`                                                                        |
| `CtaButton`                          | `<Button intent="primary" size="lg">`                                                              |
| `SecondaryButton`                    | `<Button intent="secondary">`                                                                      |
| `OutlineButton`                      | `<Button intent="secondary">`                                                                      |
| `TextButton`                         | `<Button intent="ghost">`                                                                          |
| `LinkButton` (button styled as link) | `<Button intent="ghost" render={<Link to="..." />}>` — Button composes via Base UI's `render` prop |
| `DestructiveButton` / `DangerButton` | `<Button intent="destructive">`                                                                    |
| `IconButton`                         | Deferred — will be covered by a dedicated `IconButton` wrapper once icons land (D4).               |

Fase 6 (Alexandria migration) will perform the codemod. This document is the
contract.
