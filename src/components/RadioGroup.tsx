import type { ComponentProps } from 'react';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import { Radio as BaseRadio } from '@base-ui/react/radio';
import { cn } from '../lib/cn';
import styles from './RadioGroup.module.css';

/**
 * A set of mutually exclusive options (the shadcn **RadioGroup** contract).
 * Wraps Base UI's `RadioGroup`, which renders a `role="radiogroup"` container
 * carrying the shared value, roving-tabindex arrow-key navigation and the
 * hidden form input.
 *
 * Third of the boolean/choice form-control family (Checkbox → Switch →
 * **Radio**). Unlike Checkbox / Switch — single self-contained atoms — Radio is
 * **compound** (`RadioGroup` + `RadioGroupItem`), because the selection
 * semantics (single choice, arrow navigation, the submitted value) live on the
 * group, not the individual control. This matches shadcn and ARIA APG.
 *
 * Like the other form atoms (Escuela 1, D11) it owns no labels: pair the group
 * with a `<label>` / `aria-labelledby`, and each item with a `<label htmlFor>`.
 * Error state is conveyed via `aria-invalid` on the group, not a custom prop.
 *
 * @example
 * <RadioGroup defaultValue="card" aria-labelledby="pay-label">
 *   <span id="pay-label">Payment method</span>
 *   <label htmlFor="pay-card">
 *     <RadioGroupItem id="pay-card" value="card" /> Card
 *   </label>
 *   <label htmlFor="pay-cash">
 *     <RadioGroupItem id="pay-cash" value="cash" /> Cash
 *   </label>
 * </RadioGroup>
 */
export interface RadioGroupProps extends ComponentProps<typeof BaseRadioGroup> {}

export function RadioGroup({ className, ...rest }: RadioGroupProps) {
  return (
    <BaseRadioGroup
      data-pharos-slot="radio-group"
      className={cn(styles.group, className)}
      {...rest}
    />
  );
}

RadioGroup.displayName = 'RadioGroup';

/**
 * A single radio button within a `RadioGroup`. Wraps Base UI's `Radio` — a
 * `role="radio"` button plus a hidden form input — and requires a unique
 * `value` identifying it within the group. The selected dot is a `<span>`
 * styled with CSS (no icon dependency).
 */
export interface RadioGroupItemProps extends ComponentProps<typeof BaseRadio.Root> {}

export function RadioGroupItem({ className, ...rest }: RadioGroupItemProps) {
  return (
    <BaseRadio.Root
      data-pharos-slot="radio-group-item"
      className={cn(styles.item, className)}
      {...rest}
    >
      <BaseRadio.Indicator className={styles.indicator} />
    </BaseRadio.Root>
  );
}

RadioGroupItem.displayName = 'RadioGroupItem';
