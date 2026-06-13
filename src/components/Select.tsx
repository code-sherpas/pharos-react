import type { ComponentProps } from 'react';
import { Select as BaseSelect } from '@base-ui/react/select';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import styles from './Select.module.css';

/**
 * Single- or multi-select from a **known set of options** (Decision D17).
 * Wraps Base UI's `Select.*` parts, which implement the ARIA **listbox**
 * pattern: a trigger button opens a popup with `role="listbox"` whose rows
 * are `role="option"`, with roving focus, typeahead and Escape-to-close.
 *
 * This is deliberately distinct from the `Combobox` atom (also D17). A
 * Select has **no text input** — the user picks from a closed list. When the
 * option set is large enough to need filtering, or the value can be typed,
 * that is a Combobox (the APG combobox pattern). shadcn, Base UI and ARIA APG
 * all separate the two under exactly these names, which is why Pharos ships
 * two atoms rather than one component with a `searchable` axis. See
 * `NAMING-decisions.md` § Select.
 *
 * Multi-select is the `multiple` axis on the root (not a separate atom),
 * matching Base UI / shadcn / React Aria: pass `multiple` and `value`
 * becomes an array. Single-select closes on pick; multi-select keeps the
 * popup open so selections accumulate — Base UI derives this from `multiple`
 * and Pharos does not override it.
 *
 * Naming follows shadcn (`Select*`). `SelectTrigger` folds Base UI's
 * `Trigger` + the chevron `Icon`; `SelectContent` collapses `Portal` +
 * `Positioner` + `Popup` + `List` with `side` / `align` / `sideOffset`
 * props; `SelectItem` folds `Item` + `ItemText` + the selected-state
 * `ItemIndicator` — the same ergonomics shadcn exposes over Radix. The popup
 * takes `width: var(--anchor-width)` so it matches the trigger width exactly
 * (long options truncate; override `width` via `className` for a wider panel).
 *
 * Following the form-control composition rule (Escuela 1, D11), the atom owns
 * no label / helper / error message — the consumer composes those, and the
 * error state is conveyed through the standard `aria-invalid` attribute on
 * the trigger (the CSS reacts to `[aria-invalid="true"]`).
 *
 * **Always pass `items` (a value→label map) when the value differs from its
 * label.** Base UI's `SelectValue` resolves the trigger label from the root's
 * `items` prop, NOT from the `SelectItem` children — those are the listbox
 * label + typeahead text. This holds for interactive selection too: without
 * `items` the trigger shows the serialized raw value (the enum
 * `"organization"`, not `"Organization"`). The idiomatic, drift-free pattern
 * is a single options source that feeds both `items` and the rendered items.
 *
 * @example
 * const VISIBILITY = { private: 'Private', organization: 'Organization', public: 'Public' };
 *
 * <Select value={value} onValueChange={setValue} items={VISIBILITY}>
 *   <SelectTrigger aria-label="Visibility">
 *     <SelectValue placeholder="Select visibility" />
 *   </SelectTrigger>
 *   <SelectContent>
 *     {Object.entries(VISIBILITY).map(([v, label]) => (
 *       <SelectItem key={v} value={v}>
 *         {label}
 *       </SelectItem>
 *     ))}
 *   </SelectContent>
 * </Select>
 */
export type SelectProps<
  Value,
  Multiple extends boolean | undefined = false,
> = BaseSelect.Root.Props<Value, Multiple>;

export function Select<Value, Multiple extends boolean | undefined = false>(
  props: SelectProps<Value, Multiple>,
) {
  return <BaseSelect.Root {...props} />;
}

Select.displayName = 'Select';

/**
 * A downward chevron, inlined as an SVG so the published bundle pulls no icon
 * dependency (Pharos does not bundle `lucide-react`; D4 keeps Lucide as the
 * canonical source for the path data). Rotates 180° when the popup opens via
 * the `[data-popup-open]` selector on the wrapping `SelectIcon`.
 */
function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A check mark for the selected option, inlined for the same reason. */
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const triggerVariants = cva(styles.trigger, {
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

type TriggerVariantProps = VariantProps<typeof triggerVariants>;

/**
 * The button that opens the listbox. Shares the Input chrome (border tone,
 * focus ring, size grid) so a Select sits flush next to an Input on a form
 * row. Folds the trailing chevron, and lays children out before it — the
 * common case is a single `<SelectValue />`. The `size` axis (sm / md / lg)
 * matches the Input and Button heights.
 *
 * Give it an accessible name with `aria-label` (or wire a `<label>` /
 * `aria-labelledby`) — the trigger only shows the chosen value, not a label.
 */
export interface SelectTriggerProps
  extends ComponentProps<typeof BaseSelect.Trigger>, TriggerVariantProps {}

export function SelectTrigger({ size, className, children, ...rest }: SelectTriggerProps) {
  const resolvedSize = size ?? 'md';
  return (
    <BaseSelect.Trigger
      data-pharos-slot="select-trigger"
      data-pharos-size={resolvedSize}
      className={cn(triggerVariants({ size: resolvedSize }), className)}
      {...rest}
    >
      {children}
      <BaseSelect.Icon className={styles.icon}>
        <ChevronDownIcon />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

SelectTrigger.displayName = 'SelectTrigger';

/**
 * Renders the selected option's label inside the trigger, or the
 * `placeholder` when nothing is selected. Wraps Base UI's `Select.Value`;
 * pass a render function as `children` to format the value yourself.
 */
export type SelectValueProps = ComponentProps<typeof BaseSelect.Value>;

export function SelectValue({ className, ...rest }: SelectValueProps) {
  return (
    <BaseSelect.Value
      data-pharos-slot="select-value"
      className={cn(styles.value, className)}
      {...rest}
    />
  );
}

SelectValue.displayName = 'SelectValue';

/**
 * The floating listbox. Collapses Base UI's `Portal` + `Positioner` +
 * `Popup` + `List` so the consumer positions it with the props that matter
 * at the call site. Defaults match the common select: opens below the
 * trigger, aligned to its start edge, 8px away, and matches the trigger width
 * (`width: var(--anchor-width)`).
 */
export interface SelectContentProps extends ComponentProps<typeof BaseSelect.Popup> {
  /**
   * Which side of the trigger the listbox opens on.
   * @default 'bottom'
   */
  side?: ComponentProps<typeof BaseSelect.Positioner>['side'];
  /**
   * Alignment of the listbox relative to the trigger along the chosen side.
   * @default 'start'
   */
  align?: ComponentProps<typeof BaseSelect.Positioner>['align'];
  /**
   * Gap in pixels between the trigger and the listbox.
   * @default 8
   */
  sideOffset?: ComponentProps<typeof BaseSelect.Positioner>['sideOffset'];
  /**
   * Offset in pixels along the alignment axis.
   * @default 0
   */
  alignOffset?: ComponentProps<typeof BaseSelect.Positioner>['alignOffset'];
}

export function SelectContent({
  side = 'bottom',
  align = 'start',
  sideOffset = 8,
  alignOffset = 0,
  className,
  children,
  ...rest
}: SelectContentProps) {
  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
      >
        <BaseSelect.Popup
          data-pharos-slot="select-content"
          className={cn(styles.content, className)}
          {...rest}
        >
          <BaseSelect.List>{children}</BaseSelect.List>
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

SelectContent.displayName = 'SelectContent';

/**
 * A single option. Folds Base UI's `Item` + `ItemText` (the label, also used
 * as the value shown in the trigger) + `ItemIndicator` (the check shown when
 * the option is selected). The `value` prop is required by Base UI and is
 * what `onValueChange` reports.
 */
export interface SelectItemProps extends ComponentProps<typeof BaseSelect.Item> {}

export function SelectItem({ className, children, ...rest }: SelectItemProps) {
  return (
    <BaseSelect.Item
      data-pharos-slot="select-item"
      className={cn(styles.item, className)}
      {...rest}
    >
      <BaseSelect.ItemText className={styles.itemText}>{children}</BaseSelect.ItemText>
      <BaseSelect.ItemIndicator className={styles.itemIndicator}>
        <CheckIcon />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}

SelectItem.displayName = 'SelectItem';

/**
 * Groups related options under an optional `SelectLabel` for accessible
 * sectioning (`role="group"`).
 */
export type SelectGroupProps = ComponentProps<typeof BaseSelect.Group>;

export function SelectGroup(props: SelectGroupProps) {
  return <BaseSelect.Group data-pharos-slot="select-group" {...props} />;
}

SelectGroup.displayName = 'SelectGroup';

/**
 * A non-interactive heading for a `SelectGroup`. Renders Base UI's
 * `Select.GroupLabel`, which wires `aria-labelledby` on the surrounding
 * group — use the two together when a section needs an accessible name.
 */
export type SelectLabelProps = ComponentProps<typeof BaseSelect.GroupLabel>;

export function SelectLabel({ className, ...rest }: SelectLabelProps) {
  return (
    <BaseSelect.GroupLabel
      data-pharos-slot="select-label"
      className={cn(styles.label, className)}
      {...rest}
    />
  );
}

SelectLabel.displayName = 'SelectLabel';

/** A thin divider between groups of options. */
export type SelectSeparatorProps = ComponentProps<typeof BaseSelect.Separator>;

export function SelectSeparator({ className, ...rest }: SelectSeparatorProps) {
  return (
    <BaseSelect.Separator
      data-pharos-slot="select-separator"
      className={cn(styles.separator, className)}
      {...rest}
    />
  );
}

SelectSeparator.displayName = 'SelectSeparator';
