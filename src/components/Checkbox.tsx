import type { ComponentProps } from 'react';
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { cn } from '../lib/cn';
import styles from './Checkbox.module.css';

/**
 * A single square checkbox control (the shadcn **Checkbox** contract). Wraps
 * Base UI's `Checkbox`, which renders a `role="checkbox"` button plus a hidden
 * form input, and carries the ARIA state (`aria-checked`, including the
 * `mixed` value for the indeterminate state), keyboard toggle (Space) and
 * focus handling.
 *
 * Like `Input` / `Textarea` (Escuela 1, D11), the atom owns no label: pair it
 * with a `<label htmlFor>`. Error state is conveyed via `aria-invalid`, not a
 * custom prop.
 *
 * Indeterminate uses Base UI's boolean `indeterminate` prop (not shadcn's
 * `checked="indeterminate"` string union — a Radix quirk). Base UI's split is
 * cleaner and better typed; per Rule #0 the DS follows the primitive here.
 *
 * @example
 * <label htmlFor="terms" className="flex items-center gap-2">
 *   <Checkbox id="terms" checked={agreed} onCheckedChange={setAgreed} />
 *   I accept the terms
 * </label>
 */
export interface CheckboxProps extends ComponentProps<typeof BaseCheckbox.Root> {}

function CheckIcon() {
  return (
    <svg
      className={cn(styles.icon, styles.iconCheck)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IndeterminateIcon() {
  return (
    <svg
      className={cn(styles.icon, styles.iconIndeterminate)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
    </svg>
  );
}

export function Checkbox({ className, ...rest }: CheckboxProps) {
  return (
    <BaseCheckbox.Root data-pharos-slot="checkbox" className={cn(styles.root, className)} {...rest}>
      <BaseCheckbox.Indicator className={styles.indicator}>
        <CheckIcon />
        <IndeterminateIcon />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
}

Checkbox.displayName = 'Checkbox';
