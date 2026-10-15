---
'@code-sherpas/pharos-react': patch
---

Input, Textarea and Combobox type at 16px on touch screens (`pointer: coarse`), so iOS Safari no longer zooms the page into a focused field and consumers can stop forbidding zoom with `maximum-scale=1` (WCAG 1.4.4). Desktop sizes are unchanged.
