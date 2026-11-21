import { describe, it, expect, vi } from 'vitest';
import { forwardRef, type ComponentPropsWithoutRef, type MouseEvent } from 'react';
import { render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import userEvent from '@testing-library/user-event';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbText,
} from '../src/components/Breadcrumb';

/** Section › item › current step: the shape of an inner screen. */
function ReportBreadcrumb({
  onOpenSection,
}: {
  onOpenSection?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Breadcrumb aria-label="Breadcrumb">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/assessments" onClick={onOpenSection}>
            Competency assessments
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/assessments/7">Q3 engineering review</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Report</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/** A level the person cannot open, between the section and the current step. */
function ProjectsOfSomeoneElse() {
  return (
    <Breadcrumb aria-label="Breadcrumb">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/team">Team</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbText>Grace Hopper</BreadcrumbText>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Projects</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/** Stands in for a router's link component, the way Next's `Link` is passed. */
const RouterLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<'a'> & { to: string }>(
  function RouterLink({ to, ...rest }, ref) {
    return <a ref={ref} href={to} data-router-link="" {...rest} />;
  },
);

describe('Breadcrumb', () => {
  it('is a navigation region with the name the consumer gives it', () => {
    render(<ReportBreadcrumb />);

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('lists the levels in order, without counting the separators as levels', () => {
    render(<ReportBreadcrumb />);

    const list = within(screen.getByRole('navigation')).getByRole('list');
    expect(list.tagName).toBe('OL');
    expect(
      within(list)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['Competency assessments', 'Q3 engineering review', 'Report']);
  });

  it('makes each level above the current screen a link to it', () => {
    render(<ReportBreadcrumb />);

    expect(screen.getByRole('link', { name: 'Competency assessments' })).toHaveAttribute(
      'href',
      '/assessments',
    );
    expect(screen.getByRole('link', { name: 'Q3 engineering review' })).toHaveAttribute(
      'href',
      '/assessments/7',
    );
  });

  it('marks the current screen as the page, and does not make it a link', () => {
    render(<ReportBreadcrumb />);

    const current = screen.getByText('Report');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: 'Report' })).toBeNull();
    expect(current).not.toHaveAttribute('role');
    expect(current).not.toHaveAttribute('tabindex');
  });

  it('reaches the links with Tab, skips the current screen, and follows a link with Enter', async () => {
    const openSection = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    const user = userEvent.setup();
    render(
      <>
        <ReportBreadcrumb onOpenSection={openSection} />
        <button type="button">After the breadcrumb</button>
      </>,
    );

    await user.tab();
    expect(screen.getByRole('link', { name: 'Competency assessments' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(openSection).toHaveBeenCalledTimes(1);

    await user.tab();
    expect(screen.getByRole('link', { name: 'Q3 engineering review' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After the breadcrumb' })).toHaveFocus();
  });

  it('shows a level the person cannot open as text: not a link, not the current screen, not focusable', async () => {
    const user = userEvent.setup();
    render(<ProjectsOfSomeoneElse />);

    const level = screen.getByText('Grace Hopper');
    expect(screen.queryByRole('link', { name: 'Grace Hopper' })).toBeNull();
    expect(level).not.toHaveAttribute('aria-current');
    expect(level).toHaveAttribute('data-pharos-slot', 'breadcrumb-text');
    expect(screen.getByText('Projects')).toHaveAttribute('data-pharos-slot', 'breadcrumb-page');

    await user.tab();
    expect(screen.getByRole('link', { name: 'Team' })).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it('hides the separators from assistive technology, so nothing between the levels is read', () => {
    render(<ReportBreadcrumb />);

    const separators = document.querySelectorAll('[data-pharos-slot="breadcrumb-separator"]');
    expect(separators).toHaveLength(2);
    for (const separator of separators) {
      expect(separator).toHaveAttribute('aria-hidden', 'true');
      expect(separator).toHaveAttribute('role', 'presentation');
      expect(separator.textContent).toBe('');
      expect(separator.querySelector('svg')).toHaveAttribute('data-pharos-icon', 'chevron-right');
    }
  });

  it("lets the consumer replace a separator's chevron, still hidden", () => {
    render(
      <Breadcrumb aria-label="Breadcrumb">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    const separator = screen.getByText('/');
    expect(separator).toHaveAttribute('aria-hidden', 'true');
    expect(separator.querySelector('svg')).toBeNull();
  });

  it("hands a level to the application's router link, keeping the breadcrumb's look and the router's behaviour", async () => {
    const navigate = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    const user = userEvent.setup();
    render(
      <Breadcrumb aria-label="Breadcrumb">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<RouterLink to="/team" onClick={navigate} />}>
              Team
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Ada Lovelace</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    const link = screen.getByRole('link', { name: 'Team' });
    expect(link).toHaveAttribute('href', '/team');
    expect(link).toHaveAttribute('data-router-link');
    expect(link).toHaveAttribute('data-pharos-slot', 'breadcrumb-link');
    await user.click(link);
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('renders on the server, current screen and all', () => {
    const html = renderToString(<ReportBreadcrumb />);

    expect(html).toContain('<nav');
    expect(html).toContain('aria-label="Breadcrumb"');
    expect(html).toContain('aria-current="page"');
  });

  it('requires a name for the navigation region at the type level', () => {
    function unnamed() {
      // @ts-expect-error — a breadcrumb without aria-label or aria-labelledby does not compile.
      return <Breadcrumb />;
    }
    expect(typeof unnamed).toBe('function');
  });
});
