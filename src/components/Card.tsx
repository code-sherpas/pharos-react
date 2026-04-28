import type { ComponentPropsWithoutRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import styles from './Card.module.css';

/**
 * Container surface for grouped content. Three variants on the
 * border-intensity hierarchy (Decision D12):
 *
 * - `default` (subtle border, no shadow) — the most common card. Sits
 *   on the same `neutral-200` tone as `Separator`, so panels and
 *   dividers harmonise visually.
 * - `elevated` (no border, soft shadow) — for surfaces that should lift
 *   off the canvas (modals' inner cards, important callouts).
 * - `outlined` (deliberately stronger border, no shadow) — emphasised
 *   container. Sits on `neutral-300`, between subtle non-interactive
 *   tone and the strong interactive tone reserved for controls.
 *
 * Sub-components (`CardHeader`, `CardTitle`, `CardDescription`,
 * `CardContent`, `CardFooter`) are slot primitives, not separate atoms
 * — same pattern shadcn uses. They are exported individually so the
 * consumer composes the structure they need; an empty Card with no
 * slots is equally valid.
 */
const cardVariants = cva(styles.card, {
  variants: {
    variant: {
      default: styles.default,
      elevated: styles.elevated,
      outlined: styles.outlined,
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type CardVariantProps = VariantProps<typeof cardVariants>;

export interface CardProps extends ComponentPropsWithoutRef<'div'>, CardVariantProps {}

export function Card({ variant, className, ...rest }: CardProps) {
  const resolvedVariant = variant ?? 'default';
  return (
    <div
      data-pharos-variant={resolvedVariant}
      className={cn(cardVariants({ variant: resolvedVariant }), className)}
      {...rest}
    />
  );
}

Card.displayName = 'Card';

export interface CardHeaderProps extends ComponentPropsWithoutRef<'div'> {}

export function CardHeader({ className, ...rest }: CardHeaderProps) {
  return <div data-pharos-slot="card-header" className={cn(styles.header, className)} {...rest} />;
}

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends ComponentPropsWithoutRef<'div'> {}

export function CardTitle({ className, ...rest }: CardTitleProps) {
  // Renders as a `<div>` so the consumer picks the semantic heading
  // level (`<h2>`, `<h3>`, etc.) by wrapping or by using the native
  // `role` and `aria-level` attributes if needed. Same default as
  // shadcn's CardTitle — atoms do not impose document outline.
  return <div data-pharos-slot="card-title" className={cn(styles.title, className)} {...rest} />;
}

CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends ComponentPropsWithoutRef<'p'> {}

export function CardDescription({ className, ...rest }: CardDescriptionProps) {
  return (
    <p
      data-pharos-slot="card-description"
      className={cn(styles.description, className)}
      {...rest}
    />
  );
}

CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends ComponentPropsWithoutRef<'div'> {}

export function CardContent({ className, ...rest }: CardContentProps) {
  return (
    <div data-pharos-slot="card-content" className={cn(styles.content, className)} {...rest} />
  );
}

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends ComponentPropsWithoutRef<'div'> {}

export function CardFooter({ className, ...rest }: CardFooterProps) {
  return <div data-pharos-slot="card-footer" className={cn(styles.footer, className)} {...rest} />;
}

CardFooter.displayName = 'CardFooter';

export { cardVariants };
