# Rules for consumers of `@code-sherpas/pharos-react`

This file ships with the package (`files` includes `RULES.md`). Every
consumer — `alexandria-web-application`, `alexandria-design`, and any future
app — must follow these rules.

## 1. Only Pharos components for UI

Forbidden:

- Hand-rolled `<button>` / `<input>` when `Button` / `Input` exists in
  `@code-sherpas/pharos-react`.
- Importing primitives (`@radix-ui/*`, `@base-ui/*`, `antd`,
  `@heroicons/*`, `@headlessui/*`) directly. Pharos wraps what it needs.
- Copy-pasting a Pharos component into the consumer and modifying it. If
  Pharos is missing a variant, open an issue in this repo.

## 2. Use the canonical names

Pharos names follow shadcn/ui > Base UI > ARIA APG (tiebreaker: shorter
name). If you are migrating Alexandria, translate the old name to the Pharos
canonical one — do not alias.

| Alexandria-ish             | Pharos canonical         |
| -------------------------- | ------------------------ |
| `PrimaryButton` / `CtaBtn` | `<Button variant="…" />` |
| `Modal` / `Popup`          | `Dialog`                 |
| `Drawer` / `SidePanel`     | `Sheet`                  |
| `Toast` / `Notification`   | `Toast`                  |
| `Chip` / `Pill` / `Tag`    | `Badge`                  |

(Full list lives in `NAMING-decisions.md` once Phase 2 starts.)

## 3. Import the stylesheet once

```ts
// in your app's root entry file
import '@code-sherpas/pharos-react/styles.css';
```

This loads the compiled Tailwind v4 output plus the `@theme inline` mapping
to `--pharos-*`. Without it, components render unstyled.

## 4. `pharos-tokens` is a peer dependency

Consumers must install it explicitly. It is not transitively bundled to
avoid duplicate CSS var declarations:

```bash
pnpm add @code-sherpas/pharos-react @code-sherpas/pharos-tokens
```

Version compatibility is declared via `peerDependencies` in
`pharos-react/package.json`. Upgrade both together.

## 5. Respect the variants API

Pharos components expose their full variant axis (size, tone, intent, etc.)
via props. Forbidden:

- Overriding internal class names to "fake" a variant that does not exist.
- Passing `className` strings that conflict with the component's theme
  (e.g. `className="bg-red-500"` on a `<Button>` to make it red — use
  `intent="destructive"` or open an issue).

`className` is allowed for layout tweaks (margins, widths), not visual
identity.

## 6. Respect semver

- Breaking change in this repo → major bump → consumers upgrade explicitly.
- New component or variant → minor bump → consumers may adopt freely.
- Bugfix, visual tweak, or internal refactor → patch → consumers get it for
  free.

Every PR that affects the public API includes a changeset. If your PR does
not, CI will fail.

## 7. Icons

Pharos uses **Lucide** (decision D4). When a component needs an icon you do
not pass, Pharos renders the Lucide default. If you need a custom icon,
open a PR to add it under `src/icons/` — do not ship icons from the
consumer that duplicate Lucide.

## 8. Extensions and forks

Do not publish `@yourorg/pharos-react-extended`. If a product needs its own
components, build them in the consumer under your own naming namespace and
document it. If the need is general, propose it in this repo.
