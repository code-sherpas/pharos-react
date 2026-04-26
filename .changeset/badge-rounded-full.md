---
'@code-sherpas/pharos-react': patch
---

`Badge` shape changes from `rounded-md` to `rounded-full` for visual
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
