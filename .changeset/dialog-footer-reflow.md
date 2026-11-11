---
'@code-sherpas/pharos-react': patch
'@examples/saas-demo': patch
---

Dialog, AlertDialog and Sheet: the footer's actions wrap onto further rows when they do not fit side by side (320px, 200% zoom, labels that say what they do), still at the end and in DOM order, instead of running off the edge (WCAG 1.4.10). Button: a label wider than its whole container wraps between words inside a Button that is never wider than the container; heights become minimums (one line keeps 32 / 40 / 48). In a row a Button still does not shrink. No API change.
