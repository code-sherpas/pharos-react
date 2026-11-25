---
'@code-sherpas/pharos-react': minor
---

Add `Breadcrumb`, for the inner screens of a section (the detail of an item, a step on it): it says where the person is inside the section and lets them go up a level. Parts follow shadcn on the ARIA APG breadcrumb pattern — `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator` — plus `BreadcrumbText`, also at the `@code-sherpas/pharos-react/Breadcrumb` subpath.

`Breadcrumb` is a `<nav>` whose accessible name (`aria-label` or `aria-labelledby`) is required by its type, since Pharos puts no text of its own; `BreadcrumbList` is an `<ol>`. `BreadcrumbLink` is an `<a href>` in seablue (`primary-600`), underlined, with Pharos's shared focus ring, and takes `render` to become the application's router link. `BreadcrumbPage` is the current screen: plain text with `aria-current="page"`, not a link and not focusable (unlike shadcn, it carries no `role="link"`). `BreadcrumbText` is a level the person cannot open, shown as text in a regular weight so it is told apart from both a link and the current screen. `BreadcrumbSeparator` is a presentational item hidden from assistive technology, with Lucide's `chevron-right` mirrored in right-to-left text.

Long names wrap onto more lines, inside a level and between levels, down to 320 px: nothing is truncated and there is no `BreadcrumbEllipsis`. Every level is at least 24 px tall.
