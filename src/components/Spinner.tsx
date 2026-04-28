import type { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import styles from './Spinner.module.css';

/**
 * Maps the `size` axis to per-class names inside `Spinner.module.css`. Sizes
 * align with the Button / Input / Textarea grid (16 / 20 / 24 px) so a
 * Spinner sits flush inside a control of the same size — Composition cases
 * like `<Button><Spinner /></Button>` work out of the box because the
 * Spinner inherits the Button's `currentColor`.
 *
 * No `variant` / `tone` axis on purpose. State-of-the-art DSes (Radix
 * Themes, Mantine, shadcn) keep the Spinner as a single chrome that uses
 * `currentColor`; the consumer picks the colour by setting `color` on the
 * parent (or via `className`). This keeps the atom small and removes the
 * need for a tone palette mapping.
 */
const spinnerVariants = cva(styles.spinner, {
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

type SpinnerVariantProps = VariantProps<typeof spinnerVariants>;

/**
 * Props accepted by `<Spinner>`. The component renders a `<span role="status">`
 * with an inline SVG that rotates via CSS keyframes (no JS, no animation
 * libraries). Screen readers announce the `srLabel` (default `"Loading…"`)
 * via a visually hidden `<span>` inside the status node — the same a11y
 * pattern shadcn / Radix Themes / Material UI use.
 *
 * - `size` aligns with the control grid (Button / Input / Textarea).
 * - `srLabel` is the announced text. Pass an explicit one when the loading
 *   action is specific (e.g. `"Saving template…"`); the default suits
 *   generic "something is loading" cases.
 * - Native `<span>` props (e.g. `style`, `aria-*`) pass through. If the
 *   consumer sets `aria-label` directly, that wins over `srLabel` for
 *   assistive tech (the `srLabel` `<span>` is then redundant but harmless).
 */
export interface SpinnerProps extends ComponentProps<'span'>, SpinnerVariantProps {
  /**
   * Visually hidden text announced by assistive tech. Pass an explicit
   * label tied to the action (e.g. `"Submitting form…"`) when relevant.
   *
   * @default "Loading…"
   */
  srLabel?: string;
}

export function Spinner({
  size,
  className,
  srLabel = 'Loading…',
  children,
  ref,
  ...rest
}: SpinnerProps) {
  const resolvedSize = size ?? 'md';
  return (
    <span
      ref={ref}
      role="status"
      data-pharos-size={resolvedSize}
      className={cn(spinnerVariants({ size: resolvedSize }), className)}
      {...rest}
    >
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        aria-hidden="true"
        focusable="false"
      >
        {/*
         * Single arc that completes ~75 % of the circle. The remaining gap
         * gives the visual rotation a clear lead/tail under the CSS spin
         * animation. Same shape Radix Themes / Mantine use; differs from
         * shadcn's lucide-Loader2 only in being inline and dependency-free.
         */}
        <circle cx="12" cy="12" r="10" strokeDasharray="50 25" />
      </svg>
      <span className={styles.srOnly}>{srLabel}</span>
      {children}
    </span>
  );
}

Spinner.displayName = 'Spinner';

export { spinnerVariants };
