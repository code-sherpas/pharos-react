---
'@code-sherpas/pharos-react': minor
---

Add `Card` atom with the slot family `CardHeader`, `CardTitle`,
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
