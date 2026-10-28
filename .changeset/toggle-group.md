---
'@code-sherpas/pharos-react': minor
---

New `ToggleGroup` + `ToggleGroupItem` (decision D25): two to five options side by side, where choosing one changes what the view shows at once — a list shown as List / Grid. The artifact «Pharos» calls it SegmentedControl; Pharos uses shadcn's canonical name. It wraps Base UI's `ToggleGroup`: a `role="group"` of `aria-pressed` buttons, one tab stop, arrow keys to move, Enter or Space to press. In single mode one item always stays pressed; `multiple` allows any number, none included. `size` is `sm` (32px) or `md` (40px, default). The look is the artifact's: a `paper-200` rail with the pressed segment lifted in white. Like Base UI, the value is an array: `value={[view]}` and `onValueChange={(v) => setView(v[0])}`.
