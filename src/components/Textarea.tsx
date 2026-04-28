import type { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import styles from './Textarea.module.css';

/**
 * Maps the `size` axis to per-class names inside `Textarea.module.css`. Like
 * `Input`, `Textarea` has no `variant` axis on purpose — shadcn's primitive
 * contract is a single styled `<textarea>` and the design-system best
 * practice for form controls is one chrome with explicit error / disabled /
 * readonly states. Composition around the textarea (label, helper, error
 * message) belongs to the future `<Field>` molecule, not to this atom
 * (Escuela 1 from the field-pattern decision, 2026-04-27).
 *
 * The three sizes share the resting visual contract with `<Input size>` so
 * a textarea sits flush next to inputs of the same size in a form: identical
 * inline padding, identical resting border tone (`neutral-500`), identical
 * font-size hop at `lg`, identical focus ring. The vertical dimension is
 * `min-height` instead of a fixed `height` because textareas grow with
 * content and the user can drag them taller (`resize: vertical`).
 */
const textareaVariants = cva(styles.textarea, {
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

type TextareaVariantProps = VariantProps<typeof textareaVariants>;

/**
 * Props accepted by `<Textarea>`. Extends every native `<textarea>`
 * attribute. Unlike `<Input>`, no native attribute is shadowed — the native
 * `<textarea>` does not have a `size` attribute, so the typed Pharos size
 * axis takes the slot without collision.
 *
 * Error state is conveyed through the standard `aria-invalid` attribute,
 * not a custom `error` prop. The CSS reacts to `[aria-invalid="true"]`,
 * matching shadcn / Base UI / Mantine. The actual error message is rendered
 * by the consumer next to the textarea (or by the future `<Field>` molecule).
 */
export interface TextareaProps extends ComponentProps<'textarea'>, TextareaVariantProps {}

export function Textarea({ size, className, ref, ...rest }: TextareaProps) {
  const resolvedSize = size ?? 'md';
  return (
    <textarea
      ref={ref}
      data-pharos-size={resolvedSize}
      className={cn(textareaVariants({ size: resolvedSize }), className)}
      {...rest}
    />
  );
}

Textarea.displayName = 'Textarea';

export { textareaVariants };
