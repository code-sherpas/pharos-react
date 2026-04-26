import type { ComponentPropsWithoutRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import styles from './Badge.module.css';

/**
 * Maps the `variant` axis to per-class names inside `Badge.module.css`.
 * The variant set follows shadcn/ui — `default`, `secondary`, `destructive`,
 * `outline` — extended with the semantic tones every modern DS exposes
 * (`success`, `warning`, `info`). Naming stays asymmetric on purpose:
 * `destructive` is the canonical shadcn name for "negative tone" and we
 * keep it instead of renaming it to `error`, so consumers familiar with
 * shadcn pick the right value without re-learning the API.
 */
const badgeVariants = cva(styles.badge, {
  variants: {
    variant: {
      default: styles.default,
      secondary: styles.secondary,
      destructive: styles.destructive,
      outline: styles.outline,
      success: styles.success,
      warning: styles.warning,
      info: styles.info,
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type BadgeVariantProps = VariantProps<typeof badgeVariants>;

export interface BadgeProps
  extends ComponentPropsWithoutRef<'span'>,
    BadgeVariantProps {}

export function Badge({ variant, className, ...rest }: BadgeProps) {
  const resolvedVariant = variant ?? 'default';
  return (
    <span
      data-pharos-variant={resolvedVariant}
      className={cn(badgeVariants({ variant: resolvedVariant }), className)}
      {...rest}
    />
  );
}

Badge.displayName = 'Badge';

export { badgeVariants };
