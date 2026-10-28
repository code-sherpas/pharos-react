---
'@code-sherpas/pharos-react': minor
---

`Badge` gains the brand variants `accent` (solid `accent-terracotta-700`, white text) and `accent-soft` (`accent-terracotta-50` tint, `accent-terracotta-700` text), as the artifact «Pharos» has them (decision D25). They mark content identity — a module, a topic, a category — and never an action, a selection or a system state, which stay blue or semantic. `700` and not the `600` base because white on `600` is 4.04:1 and fails AA at 12px.
