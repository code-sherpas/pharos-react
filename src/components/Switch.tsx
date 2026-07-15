import type { ComponentProps } from 'react';
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import { cn } from '../lib/cn';
import styles from './Switch.module.css';

/**
 * A single on/off toggle control (the shadcn **Switch** contract). Wraps Base
 * UI's `Switch`, which renders a `role="switch"` button plus a hidden form
 * input, and carries the ARIA state (`aria-checked`), keyboard toggle (Space)
 * and focus handling.
 *
 * Sibling to `Checkbox` (D20) in the boolean form-control family: same
 * `checked` / `onCheckedChange` / `disabled` API, same shared focus ring. The
 * difference is semantic — a Switch takes effect immediately (a setting you
 * flip), a Checkbox is a selection that is usually submitted with a form. It
 * has no third `indeterminate` state (a toggle is binary).
 *
 * Like `Input` / `Textarea` / `Checkbox` (Escuela 1, D11), the atom owns no
 * label: pair it with a `<label htmlFor>`. Error state is conveyed via
 * `aria-invalid`, not a custom prop.
 *
 * @example
 * <label htmlFor="notify" className="flex items-center gap-2">
 *   <Switch id="notify" checked={enabled} onCheckedChange={setEnabled} />
 *   Enable notifications
 * </label>
 */
export interface SwitchProps extends ComponentProps<typeof BaseSwitch.Root> {}

export function Switch({ className, ...rest }: SwitchProps) {
  return (
    <BaseSwitch.Root data-pharos-slot="switch" className={cn(styles.root, className)} {...rest}>
      <BaseSwitch.Thumb className={styles.thumb} />
    </BaseSwitch.Root>
  );
}

Switch.displayName = 'Switch';
