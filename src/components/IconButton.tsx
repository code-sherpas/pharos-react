import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import { Spinner } from './Spinner';
import styles from './IconButton.module.css';

/**
 * Maps the two public variant axes (`intent`, `size`) to the per-class names
 * inside `IconButton.module.css`. Mirrors the Button atom so an IconButton
 * sits next to a Button of the same size with matching height (32 / 40 /
 * 48 px) and shares the same intent vocabulary — `ghost` is the dominant
 * intent for icon-only controls (close, expand, dismiss…) so it is the
 * default, unlike Button where `primary` defaults.
 */
const iconButtonVariants = cva(styles.button, {
  variants: {
    intent: {
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
    intent: 'ghost',
    size: 'md',
  },
});

type IconButtonVariantProps = VariantProps<typeof iconButtonVariants>;

/**
 * Either `aria-label` or `aria-labelledby` is required at the type level.
 * An icon-only control with no accessible name is unusable for assistive
 * tech (WCAG 4.1.2). The atom enforces the constraint by construction —
 * the equivalent runtime check Chakra / Mantine emit as a console warning
 * is here a TypeScript error, so a missing label cannot ship.
 */
type IconButtonRequiredA11y =
  | { 'aria-label': string; 'aria-labelledby'?: never }
  | { 'aria-label'?: never; 'aria-labelledby': string };

/**
 * Props accepted by `<IconButton>`. Extends Base UI's
 * `useRender.ComponentProps<'button'>` minus the optional `aria-label` /
 * `aria-labelledby` (re-added as required), plus the variant axes and an
 * `isLoading` toggle that swaps the icon for a `<Spinner>` of the same
 * size.
 *
 * The `render` prop composes the IconButton as a different element while
 * keeping its styles and behaviour — same shape as Button, useful for
 * `<IconButton render={<Link to="/next" />} aria-label="Next">…</IconButton>`
 * call-sites (e.g. circle navigation buttons).
 */
export type IconButtonProps = Omit<
  useRender.ComponentProps<'button'>,
  'aria-label' | 'aria-labelledby'
> &
  IconButtonVariantProps &
  IconButtonRequiredA11y & {
    /**
     * When `true`, replaces the icon with a `<Spinner>` of matching size,
     * sets `disabled` so the action cannot fire mid-flight, and exposes
     * `aria-busy="true"` so screen readers announce the in-progress state.
     */
    isLoading?: boolean;
  };

export function IconButton({
  render,
  className,
  intent,
  size,
  isLoading,
  disabled,
  type = 'button',
  children,
  ref,
  ...rest
}: IconButtonProps) {
  const resolvedIntent = intent ?? 'ghost';
  const resolvedSize = size ?? 'md';
  const isDisabled = Boolean(disabled) || Boolean(isLoading);
  return useRender({
    render: render ?? <button />,
    ref,
    defaultTagName: 'button',
    props: {
      type,
      'data-pharos-intent': resolvedIntent,
      'data-pharos-size': resolvedSize,
      'aria-busy': isLoading ? true : undefined,
      disabled: isDisabled,
      className: cn(iconButtonVariants({ intent: resolvedIntent, size: resolvedSize }), className),
      ...rest,
      children: isLoading ? <Spinner size={resolvedSize} /> : children,
    },
  });
}

IconButton.displayName = 'IconButton';

export { iconButtonVariants };
