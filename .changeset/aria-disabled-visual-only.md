---
'@code-sherpas/pharos-react': patch
---

`aria-disabled="true"` on `Button` and `IconButton` is now visual only: they look disabled (opacity 0.5, `not-allowed` cursor, no hover or pressed change), stay focusable, and a press still reaches `onClick`. 1.0.2 also ignored the press and blocked the pointer, which broke consumers that use the state to say why an action is unavailable when it is pressed. Whoever renders the button decides what a press does: nothing while a request travels (leave `onClick` out), or explaining why.
