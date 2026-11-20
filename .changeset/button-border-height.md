---
'@code-sherpas/pharos-react': patch
---

Button: `intent="secondary"` is now the same size as every other intent. Its 1px border used to add to the size, so a secondary Button was 2px taller (34 instead of 32 in `sm`, 50 instead of 48 in `lg`) and 2px wider than a ghost or primary one with the same label, and a row mixing intents was uneven. The border now comes off the padding, keeping the 32 / 40 / 48 grid for every intent. Deliberate visual change: a secondary Button `sm` or `lg` is 2px shorter, and every secondary Button 2px narrower.
