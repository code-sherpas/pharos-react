---
'@code-sherpas/pharos-react': patch
'@examples/next-rsc': patch
---

`SidePanel` no longer stops a streamed page from hydrating. On a screen below `breakpoint.panel`, and on any screen with the panel open from the first render, switching to the modal form or registering the title changed the root's context while the page hydrated; React then rendered every Suspense boundary inside the panel's root that was still waiting for its HTML in the browser, so for an instant the page was in the DOM twice (the browser's copy and the server's hidden one). The mode is now read by the parts that need it, and the title and description register with `SidePanelContent`, so the root's context stays the same through hydration. No API change. `SidePanelTitle` and `SidePanelDescription` name and describe the surface they are in, so they belong inside `SidePanelContent`, as documented; outside it they now throw an error that says so, instead of labelling the panel from elsewhere.

`examples/next-rsc` gains a page that streams beside a `SidePanel`, checked on a phone and on a desktop.
