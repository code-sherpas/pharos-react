import type { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import styles from './Input.module.css';

/**
 * Maps the `size` axis to per-class names inside `Input.module.css`. Input
 * has no `variant` axis on purpose — shadcn's primitive contract is a single
 * styled `<input>` and the design-system best practice for form controls is
 * one chrome with explicit error / disabled / readonly states. Composition
 * around the input (label, helper, error message) belongs to a future
 * `<Field>` molecule, not to this atom (Escuela 1 from the field-pattern
 * decision, 2026-04-27).
 */
const inputVariants = cva(styles.input, {
  variants: {
    size: {
      sm: styles.sizeSm,
      md: styles.sizeMd,
      lg: styles.sizeLg,
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

type InputVariantProps = VariantProps<typeof inputVariants>;

/**
 * Props accepted by `<Input>`. Extends every native `<input>` attribute
 * except `size` — the native `size` attribute is a number (visible width
 * in characters) that is rarely used in modern apps where width comes from
 * CSS, so the slot is reused for the typed Pharos size axis. Consumers that
 * truly need the HTML attribute can set it through `style.width` or via a
 * dedicated `htmlSize` prop if we expose one later.
 *
 * Error state is conveyed through the standard `aria-invalid` attribute,
 * not a custom `error` prop. The CSS reacts to `[aria-invalid="true"]`,
 * matching shadcn / Base UI / Mantine. The actual error message is rendered
 * by the consumer next to the input (or by the future `<Field>` molecule).
 */
export interface InputProps extends Omit<ComponentProps<'input'>, 'size'>, InputVariantProps {}

export function Input({ size, className, type = 'text', ref, ...rest }: InputProps) {
  const resolvedSize = size ?? 'md';
  return (
    <input
      ref={ref}
      type={type}
      data-pharos-size={resolvedSize}
      className={cn(inputVariants({ size: resolvedSize }), className)}
      {...rest}
    />
  );
}

Input.displayName = 'Input';

export { inputVariants };
