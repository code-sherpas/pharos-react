---
'@code-sherpas/pharos-react': minor
---

Add the `Avatar` compound atom (Decision D14). Ships `Avatar`,
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
