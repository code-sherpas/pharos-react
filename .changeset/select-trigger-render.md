---
'@code-sherpas/pharos-react': minor
---

`SelectTrigger` accepts `render` to open a `Select` from another control, such as an icon-only picker: `<SelectTrigger render={<IconButton aria-label="Language: English" />}><LanguagesIcon /></SelectTrigger>`. The trigger becomes the rendered control and keeps the select semantics (`role="combobox"`, keyboard, focus return), but without the field chrome or the chevron; the rendered control's own size governs. Without `render`, `SelectTrigger` is unchanged.
