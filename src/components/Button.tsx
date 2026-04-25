import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import styles from './Button.module.css';

/**
 * Maps the two public variant axes (`intent`, `size`) to the per-class names
 * inside `Button.module.css`. CVA stays as the typed-variants mechanism
 * (Decision D9 keeps the authoring DX) but each value points at a hashed
 * CSS Modules class instead of a Tailwind utility string. The base class
 * carries layout, typography and the focus-visible ring — every variant
 * stacks on top of it.
 */
const buttonVariants = cva(styles.button, {
  variants: {
    intent: {
      // `primary` is the most emphasized CTA. It renders in neutral-900,
      // matching Alexandria's `NewButton variant="filled" tone="default"`
      // and the Linear/Vercel/Notion convention of "brand color as accent,
      // dark neutral as primary action". The blue `primary-*` palette is
      // reserved for brand accents (focus rings, highlights, badges) —
      // not for the default filled button.
      primary: styles.primary,
      secondary: styles.secondary,
      ghost: styles.ghost,
      destructive: styles.destructive,
    },
    size: {
      sm: styles.sizeSm,
      md: styles.sizeMd,
      lg: styles.sizeLg,
    },
  },
  defaultVariants: {
    intent: 'primary',
    size: 'md',
  },
});

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

/**
 * Props accepted by `<Button>`. Extends Base UI's `useRender.ComponentProps<'button'>`,
 * which means the component accepts every native `<button>` attribute plus the
 * `render` prop for composition:
 *
 * ```tsx
 * // Render as a router link (inherits all Button styles and behavior):
 * <Button render={<Link to="/dashboard" />}>Dashboard</Button>
 * // Or as a function receiving props + state:
 * <Button render={(props) => <a {...props} href="/x" />}>External</Button>
 * ```
 */
export interface ButtonProps extends useRender.ComponentProps<'button'>, ButtonVariantProps {}

export function Button({
  render,
  className,
  intent,
  size,
  type = 'button',
  ref,
  ...rest
}: ButtonProps) {
  const resolvedIntent = intent ?? 'primary';
  const resolvedSize = size ?? 'md';
  return useRender({
    render: render ?? <button />,
    ref,
    defaultTagName: 'button',
    props: {
      type,
      // `data-pharos-intent` / `data-pharos-size` are stable hooks for
      // selectors and tests. They mirror the CSS Modules class but stay
      // semantic — consumer queries do not need to know the hashed class
      // name and tests do not need to import the module to assert variant.
      'data-pharos-intent': resolvedIntent,
      'data-pharos-size': resolvedSize,
      className: cn(buttonVariants({ intent: resolvedIntent, size: resolvedSize }), className),
      ...rest,
    },
  });
}

Button.displayName = 'Button';

export { buttonVariants };
