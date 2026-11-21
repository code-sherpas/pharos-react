import { forwardRef, type ComponentPropsWithoutRef, type MouseEvent } from 'react';

/** Where inside Team the person is: the list, a member's page, or a member's projects. */
export type TeamView =
  | { kind: 'list' }
  | { kind: 'member'; memberId: string }
  | { kind: 'projects'; memberId: string };

/** The address a view would have, so each link has a real `href`. */
export function hrefOf(view: TeamView): string {
  switch (view.kind) {
    case 'list':
      return '#team';
    case 'member':
      return `#team/${view.memberId}`;
    case 'projects':
      return `#team/${view.memberId}/projects`;
  }
}

interface TeamLinkProps extends Omit<ComponentPropsWithoutRef<'a'>, 'href'> {
  to: TeamView;
  onNavigate: (view: TeamView) => void;
}

/**
 * The harness's router link: an `<a>` with a real `href` whose click moves the
 * app's state instead of loading a page — the role Next's `Link` plays in an
 * application. Passed to `BreadcrumbLink` through `render`, the way a consumer
 * wires its router.
 */
export const TeamLink = forwardRef<HTMLAnchorElement, TeamLinkProps>(function TeamLink(
  { to, onNavigate, onClick, ...rest },
  ref,
) {
  function navigateInsideTheApp(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    // A modified click keeps the browser's own behaviour (a new tab, say).
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    onNavigate(to);
  }
  return <a ref={ref} href={hrefOf(to)} onClick={navigateInsideTheApp} {...rest} />;
});
