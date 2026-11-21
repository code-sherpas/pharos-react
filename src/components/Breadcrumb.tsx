'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { useRender } from '@base-ui/react/use-render';
import { cn } from '../lib/cn';
import styles from './Breadcrumb.module.css';

/**
 * Where the person is inside a section, and the way up from there: the levels
 * above the current screen — the section, the item, the step — as links, and
 * the current screen last. For the inner screens of a section (the detail of
 * an item, a step on it); a page the main navigation opens does not need one.
 * Names and parts follow shadcn — `Breadcrumb`, `BreadcrumbList`,
 * `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator` —
 * on the ARIA APG breadcrumb pattern, plus `BreadcrumbText` for a level the
 * person cannot open.
 *
 * - **It is navigation.** `Breadcrumb` is a `<nav>` and needs an accessible
 *   name (`aria-label` or `aria-labelledby`), required by its type: Pharos
 *   puts no text of its own, so the consumer gives it, localised
 *   ("Breadcrumb", "Ruta de navegación").
 * - **The levels are an ordered list.** `BreadcrumbList` is an `<ol>`, so a
 *   screen reader says how many levels there are; each level is a
 *   `BreadcrumbItem` (`<li>`).
 * - **A level the person can open is a link.** `BreadcrumbLink` is an
 *   `<a href>`: Tab reaches it, Enter follows it. `render` hands it to the
 *   application's router link (`render={<Link href="/assessments" />}`)
 *   keeping its styles. Underlined, so it is told from text by more than
 *   colour.
 * - **The current screen is not a link.** `BreadcrumbPage` is the last level:
 *   plain text with `aria-current="page"`, not focusable. It is not given
 *   shadcn's `role="link"` + `aria-disabled`: it is not a link, and a link
 *   that does nothing is a dead end to whoever finds it.
 * - **A level the person cannot open is text.** `BreadcrumbText` shows the
 *   level without a link — the application decides, with the same rule that
 *   protects that page, so nobody follows a link to a refusal. It looks
 *   different from the current screen (regular weight, secondary colour), so
 *   the two are never confused.
 * - **The separators are not read.** `BreadcrumbSeparator` is a
 *   `role="presentation"` item hidden from assistive technology, with a
 *   Lucide chevron (inlined, D4) that points the way of the writing
 *   direction. Put one between every two levels.
 * - **Nothing is cut.** Long names wrap onto more lines, inside a level and
 *   between levels, at any width down to 320 px: no ellipsis, no truncation,
 *   and no `BreadcrumbEllipsis`.
 * - Each link is at least 24 px tall (WCAG 2.5.8).
 *
 * @example
 * <Breadcrumb aria-label="Breadcrumb">
 *   <BreadcrumbList>
 *     <BreadcrumbItem>
 *       <BreadcrumbLink render={<Link href="/assessments" />}>Assessments</BreadcrumbLink>
 *     </BreadcrumbItem>
 *     <BreadcrumbSeparator />
 *     <BreadcrumbItem>
 *       <BreadcrumbLink render={<Link href={`/assessments/${id}`} />}>{title}</BreadcrumbLink>
 *     </BreadcrumbItem>
 *     <BreadcrumbSeparator />
 *     <BreadcrumbItem>
 *       <BreadcrumbPage>Report</BreadcrumbPage>
 *     </BreadcrumbItem>
 *   </BreadcrumbList>
 * </Breadcrumb>
 */

/**
 * Either `aria-label` or `aria-labelledby` is required at the type level: a
 * page can have several navigation regions, and an unnamed one cannot be told
 * apart from the rest (the same rule as `IconButton`).
 */
type BreadcrumbRequiredName =
  | { 'aria-label': string; 'aria-labelledby'?: never }
  | { 'aria-label'?: never; 'aria-labelledby': string };

export type BreadcrumbProps = Omit<
  ComponentPropsWithoutRef<'nav'>,
  'aria-label' | 'aria-labelledby'
> &
  BreadcrumbRequiredName;

/** The navigation region that holds the breadcrumb. Named by the consumer. */
export function Breadcrumb({ className, ...rest }: BreadcrumbProps) {
  return (
    <nav data-pharos-slot="breadcrumb" className={cn(styles.breadcrumb, className)} {...rest} />
  );
}

Breadcrumb.displayName = 'Breadcrumb';

export interface BreadcrumbListProps extends ComponentPropsWithoutRef<'ol'> {}

/** The ordered list of levels, from the section down to the current screen. */
export function BreadcrumbList({ className, ...rest }: BreadcrumbListProps) {
  return <ol data-pharos-slot="breadcrumb-list" className={cn(styles.list, className)} {...rest} />;
}

BreadcrumbList.displayName = 'BreadcrumbList';

export interface BreadcrumbItemProps extends ComponentPropsWithoutRef<'li'> {}

/** One level: holds a `BreadcrumbLink`, a `BreadcrumbText` or the `BreadcrumbPage`. */
export function BreadcrumbItem({ className, ...rest }: BreadcrumbItemProps) {
  return <li data-pharos-slot="breadcrumb-item" className={cn(styles.item, className)} {...rest} />;
}

BreadcrumbItem.displayName = 'BreadcrumbItem';

export interface BreadcrumbLinkProps extends useRender.ComponentProps<'a'> {}

/**
 * A level the person can open: an `<a href>`. `render` makes it the
 * application's router link, keeping its styles.
 */
export function BreadcrumbLink({ render, className, ref, ...rest }: BreadcrumbLinkProps) {
  return useRender({
    render: render ?? <a />,
    ref,
    defaultTagName: 'a',
    props: {
      'data-pharos-slot': 'breadcrumb-link',
      className: cn(styles.link, className),
      ...rest,
    },
  });
}

BreadcrumbLink.displayName = 'BreadcrumbLink';

export interface BreadcrumbTextProps extends ComponentPropsWithoutRef<'span'> {}

/**
 * A level shown without a link, because the person cannot open it. Looks
 * apart from the current screen.
 */
export function BreadcrumbText({ className, ...rest }: BreadcrumbTextProps) {
  return (
    <span data-pharos-slot="breadcrumb-text" className={cn(styles.text, className)} {...rest} />
  );
}

BreadcrumbText.displayName = 'BreadcrumbText';

/** `aria-current` is not a prop: the current screen is always the page. */
export interface BreadcrumbPageProps extends Omit<
  ComponentPropsWithoutRef<'span'>,
  'aria-current'
> {}

/** The current screen, last: not a link, `aria-current="page"`. */
export function BreadcrumbPage({ className, ...rest }: BreadcrumbPageProps) {
  return (
    <span
      data-pharos-slot="breadcrumb-page"
      aria-current="page"
      className={cn(styles.page, className)}
      {...rest}
    />
  );
}

BreadcrumbPage.displayName = 'BreadcrumbPage';

/** Role and visibility are not props: a separator is never read. */
export interface BreadcrumbSeparatorProps extends Omit<
  ComponentPropsWithoutRef<'li'>,
  'role' | 'aria-hidden'
> {}

/**
 * Between two levels: a chevron that points the way of the writing direction,
 * hidden from assistive technology. `children` replaces the chevron.
 */
export function BreadcrumbSeparator({ className, children, ...rest }: BreadcrumbSeparatorProps) {
  return (
    <li
      data-pharos-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn(styles.separator, className)}
      {...rest}
    >
      {children ?? <ChevronIcon />}
    </li>
  );
}

BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

/** Lucide's `chevron-right`, inlined (D4). Mirrored in right-to-left text. */
function ChevronIcon() {
  return (
    <svg
      data-pharos-icon="chevron-right"
      className={styles.chevron}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
