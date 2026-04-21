import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center',
    'font-medium whitespace-nowrap select-none',
    'transition-colors ease-out',
    'cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      intent: {
        primary: [
          'bg-primary-600 text-base-white',
          'hover:bg-primary-700',
          'active:bg-primary-800',
          'focus-visible:ring-primary-600',
        ],
        secondary: [
          'bg-base-white text-neutral-900 border border-neutral-200',
          'hover:bg-neutral-50 hover:border-neutral-300',
          'active:bg-neutral-100',
          'focus-visible:ring-primary-600',
        ],
        ghost: [
          'bg-transparent text-neutral-900',
          'hover:bg-neutral-100',
          'active:bg-neutral-200',
          'focus-visible:ring-primary-600',
        ],
        destructive: [
          'bg-error text-error-on',
          'hover:bg-error-hover',
          'active:bg-error-active',
          'focus-visible:ring-error',
        ],
      },
      size: {
        sm: 'h-8 gap-1.5 rounded-md px-3 text-sm',
        md: 'h-10 gap-2 rounded-md px-4 text-sm',
        lg: 'h-12 gap-2 rounded-lg px-6 text-base',
      },
    },
    defaultVariants: {
      intent: 'primary',
      size: 'md',
    },
  },
);

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
  return useRender({
    render: render ?? <button />,
    ref,
    defaultTagName: 'button',
    props: {
      type,
      className: cn(buttonVariants({ intent, size }), className),
      ...rest,
    },
  });
}

Button.displayName = 'Button';

export { buttonVariants };
