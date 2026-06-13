import type { ComponentProps } from 'react';
import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import styles from './Combobox.module.css';

/**
 * Single- or multi-select with a **text input that filters the options**
 * (Decision D17). Wraps Base UI's `Combobox.*` parts, which implement the
 * ARIA APG **combobox** pattern: an `<input role="combobox">` with
 * `aria-expanded` / `aria-controls` pointing at a popup listbox, typeahead
 * filtering, and arrow-key navigation of the results.
 *
 * This is deliberately distinct from the `Select` atom (also D17). A Select
 * has no input — the user picks from a closed list. A Combobox is for sets
 * large enough to need filtering, or where the user expects to type. shadcn,
 * Base UI and ARIA APG separate the two; Pharos ships both rather than a
 * single component with a `searchable` axis. (Free-text entry — typing a
 * value that is not in the list — is Base UI's separate `Autocomplete`
 * primitive and is deferred; every known Alexandria call-site filters a known
 * set.) See `NAMING-decisions.md` § Combobox.
 *
 * Multi-select is the `multiple` axis on the root (not a separate atom),
 * matching Base UI / shadcn / React Aria. With `multiple`, selections render
 * as removable chips inside a `ComboboxChips` box and the popup stays open so
 * they accumulate; single-select uses a `ComboboxControl` input box and
 * closes on pick.
 *
 * Naming follows Base UI (`Combobox*`; shadcn has no canonical primitive — it
 * composes a recipe). The control chrome is split into composable parts
 * because a combobox is inherently more compositional than a select:
 * `ComboboxControl` / `ComboboxChips` own the bordered box, `ComboboxInput`
 * is the bare field, `ComboboxTrigger` the chevron. `ComboboxContent`
 * collapses `Portal` + `Positioner` + `Popup`; `ComboboxList` and
 * `ComboboxEmpty` sit inside it. The popup takes `width:
 * var(--anchor-width)` so it matches the control width exactly (long options
 * truncate) — the anchor-width affordance the picker call-sites needed.
 *
 * Per the form-control composition rule (Escuela 1, D11) the atom owns no
 * label / helper / error message; the consumer composes those and conveys
 * error via `aria-invalid`.
 *
 * @example single-select
 * <Combobox items={fruits} onValueChange={setValue}>
 *   <ComboboxControl>
 *     <ComboboxInput placeholder="Search fruit…" />
 *     <ComboboxTrigger />
 *   </ComboboxControl>
 *   <ComboboxContent>
 *     <ComboboxEmpty>No fruit found</ComboboxEmpty>
 *     <ComboboxList>
 *       {(item) => (
 *         <ComboboxItem key={item.value} value={item}>
 *           {item.label}
 *         </ComboboxItem>
 *       )}
 *     </ComboboxList>
 *   </ComboboxContent>
 * </Combobox>
 */
export type ComboboxProps<
  Value,
  Multiple extends boolean | undefined = false,
> = BaseCombobox.Root.Props<Value, Multiple>;

export function Combobox<Value, Multiple extends boolean | undefined = false>(
  props: ComboboxProps<Value, Multiple>,
) {
  return <BaseCombobox.Root {...props} />;
}

Combobox.displayName = 'Combobox';

/** A downward chevron, inlined as an SVG (Pharos bundles no icon dependency; D4). */
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

/** A small ✕ for clearing / removing, inlined for the same reason. */
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The bordered control box for **single-select**. Wraps Base UI's
 * `Combobox.InputGroup` and carries the Input chrome (border tone, focus
 * ring). Put a `ComboboxInput` and optionally a `ComboboxTrigger` /
 * `ComboboxClear` inside it.
 */
export type ComboboxControlProps = ComponentProps<typeof BaseCombobox.InputGroup>;

export function ComboboxControl({ className, ...rest }: ComboboxControlProps) {
  return (
    <BaseCombobox.InputGroup
      data-pharos-slot="combobox-control"
      className={cn(styles.control, className)}
      {...rest}
    />
  );
}

ComboboxControl.displayName = 'ComboboxControl';

/**
 * The bordered control box for **multi-select**. Wraps Base UI's
 * `Combobox.Chips`; render `ComboboxChip`s for the current selections
 * followed by a `ComboboxInput` to keep typing. Shares the `ComboboxControl`
 * chrome.
 */
export type ComboboxChipsProps = ComponentProps<typeof BaseCombobox.Chips>;

export function ComboboxChips({ className, ...rest }: ComboboxChipsProps) {
  return (
    <BaseCombobox.Chips
      data-pharos-slot="combobox-chips"
      className={cn(styles.control, styles.chips, className)}
      {...rest}
    />
  );
}

ComboboxChips.displayName = 'ComboboxChips';

const inputVariants = cva(styles.input, {
  variants: {
    size: {
      sm: styles.inputSizeSm,
      md: styles.inputSizeMd,
      lg: styles.inputSizeLg,
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

type InputVariantProps = VariantProps<typeof inputVariants>;

/**
 * The text field. Wraps Base UI's `Combobox.Input` (`role="combobox"`),
 * which owns the filtering. Renders bare — the surrounding `ComboboxControl`
 * / `ComboboxChips` box owns the border. The `size` axis (sm / md / lg)
 * matches Input/Select and applies when the input is used standalone in a
 * `ComboboxControl`; inside a `ComboboxChips` box pass `inset` so it fills
 * the chip row instead of imposing its own height.
 */
export interface ComboboxInputProps
  extends Omit<ComponentProps<typeof BaseCombobox.Input>, 'size'>, InputVariantProps {
  /**
   * Render as a flexible filler that shares the row with chips, instead of a
   * fixed-height field. Use inside `ComboboxChips`.
   * @default false
   */
  inset?: boolean;
}

export function ComboboxInput({ size, inset = false, className, ...rest }: ComboboxInputProps) {
  const resolvedSize = size ?? 'md';
  return (
    <BaseCombobox.Input
      data-pharos-slot="combobox-input"
      data-pharos-size={resolvedSize}
      className={cn(
        inset ? cn(styles.input, styles.chipsInput) : inputVariants({ size: resolvedSize }),
        className,
      )}
      {...rest}
    />
  );
}

ComboboxInput.displayName = 'ComboboxInput';

/**
 * The chevron button that toggles the popup. Wraps Base UI's
 * `Combobox.Trigger`; the chevron flips when the popup is open.
 */
export type ComboboxTriggerProps = ComponentProps<typeof BaseCombobox.Trigger>;

export function ComboboxTrigger({ className, children, ...rest }: ComboboxTriggerProps) {
  return (
    <BaseCombobox.Trigger
      data-pharos-slot="combobox-trigger"
      className={cn(styles.trigger, className)}
      {...rest}
    >
      {children ?? <ChevronDownIcon />}
    </BaseCombobox.Trigger>
  );
}

ComboboxTrigger.displayName = 'ComboboxTrigger';

/** A button that clears the current value(s). Wraps Base UI's `Combobox.Clear`. */
export type ComboboxClearProps = ComponentProps<typeof BaseCombobox.Clear>;

export function ComboboxClear({ className, children, ...rest }: ComboboxClearProps) {
  return (
    <BaseCombobox.Clear
      data-pharos-slot="combobox-clear"
      className={cn(styles.clear, className)}
      {...rest}
    >
      {children ?? <XIcon />}
    </BaseCombobox.Clear>
  );
}

ComboboxClear.displayName = 'ComboboxClear';

/** A selected-value chip for multi-select. Wraps Base UI's `Combobox.Chip`. */
export type ComboboxChipProps = ComponentProps<typeof BaseCombobox.Chip>;

export function ComboboxChip({ className, ...rest }: ComboboxChipProps) {
  return (
    <BaseCombobox.Chip
      data-pharos-slot="combobox-chip"
      className={cn(styles.chip, className)}
      {...rest}
    />
  );
}

ComboboxChip.displayName = 'ComboboxChip';

/** The ✕ that removes a chip's value. Wraps Base UI's `Combobox.ChipRemove`. */
export type ComboboxChipRemoveProps = ComponentProps<typeof BaseCombobox.ChipRemove>;

export function ComboboxChipRemove({
  className,
  children,
  'aria-label': ariaLabel = 'Remove',
  ...rest
}: ComboboxChipRemoveProps) {
  return (
    <BaseCombobox.ChipRemove
      data-pharos-slot="combobox-chip-remove"
      aria-label={ariaLabel}
      className={cn(styles.chipRemove, className)}
      {...rest}
    >
      {children ?? <XIcon />}
    </BaseCombobox.ChipRemove>
  );
}

ComboboxChipRemove.displayName = 'ComboboxChipRemove';

/**
 * The floating listbox surface. Collapses Base UI's `Portal` + `Positioner` +
 * `Popup`. Put `ComboboxEmpty` and `ComboboxList` inside it. Defaults: opens
 * below the control, aligned to its start edge, 8px away, and matches the
 * control width (`width: var(--anchor-width)`).
 */
export interface ComboboxContentProps extends ComponentProps<typeof BaseCombobox.Popup> {
  /**
   * Which side of the control the listbox opens on.
   * @default 'bottom'
   */
  side?: ComponentProps<typeof BaseCombobox.Positioner>['side'];
  /**
   * Alignment of the listbox relative to the control along the chosen side.
   * @default 'start'
   */
  align?: ComponentProps<typeof BaseCombobox.Positioner>['align'];
  /**
   * Gap in pixels between the control and the listbox.
   * @default 8
   */
  sideOffset?: ComponentProps<typeof BaseCombobox.Positioner>['sideOffset'];
  /**
   * Offset in pixels along the alignment axis.
   * @default 0
   */
  alignOffset?: ComponentProps<typeof BaseCombobox.Positioner>['alignOffset'];
}

export function ComboboxContent({
  side = 'bottom',
  align = 'start',
  sideOffset = 8,
  alignOffset = 0,
  className,
  children,
  ...rest
}: ComboboxContentProps) {
  return (
    <BaseCombobox.Portal>
      <BaseCombobox.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
      >
        <BaseCombobox.Popup
          data-pharos-slot="combobox-content"
          className={cn(styles.content, className)}
          {...rest}
        >
          {children}
        </BaseCombobox.Popup>
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  );
}

ComboboxContent.displayName = 'ComboboxContent';

/**
 * The list of results. Wraps Base UI's `Combobox.List`, which accepts either
 * static children or a render function `(item, index) => ReactNode` that maps
 * over the (already filtered) `items` passed to the root.
 */
export type ComboboxListProps = ComponentProps<typeof BaseCombobox.List>;

export function ComboboxList({ className, ...rest }: ComboboxListProps) {
  return <BaseCombobox.List data-pharos-slot="combobox-list" className={className} {...rest} />;
}

ComboboxList.displayName = 'ComboboxList';

/**
 * A single result row. Folds Base UI's `Item` + the selected-state
 * `ItemIndicator` check. The `value` prop is what `onValueChange` reports.
 */
export interface ComboboxItemProps extends ComponentProps<typeof BaseCombobox.Item> {}

export function ComboboxItem({ className, children, ...rest }: ComboboxItemProps) {
  return (
    <BaseCombobox.Item
      data-pharos-slot="combobox-item"
      className={cn(styles.item, className)}
      {...rest}
    >
      <span className={styles.itemText}>{children}</span>
      <BaseCombobox.ItemIndicator className={styles.itemIndicator}>
        <CheckIcon />
      </BaseCombobox.ItemIndicator>
    </BaseCombobox.Item>
  );
}

ComboboxItem.displayName = 'ComboboxItem';

/**
 * Shown in place of the list when the filter matches nothing. Wraps Base UI's
 * `Combobox.Empty`, which is only rendered when there are no results.
 */
export type ComboboxEmptyProps = ComponentProps<typeof BaseCombobox.Empty>;

export function ComboboxEmpty({ className, ...rest }: ComboboxEmptyProps) {
  return (
    <BaseCombobox.Empty
      data-pharos-slot="combobox-empty"
      className={cn(styles.empty, className)}
      {...rest}
    />
  );
}

ComboboxEmpty.displayName = 'ComboboxEmpty';

/** Groups related results under an optional `ComboboxGroupLabel` (`role="group"`). */
export type ComboboxGroupProps = ComponentProps<typeof BaseCombobox.Group>;

export function ComboboxGroup(props: ComboboxGroupProps) {
  return <BaseCombobox.Group data-pharos-slot="combobox-group" {...props} />;
}

ComboboxGroup.displayName = 'ComboboxGroup';

/** A non-interactive heading for a `ComboboxGroup`. Wraps `Combobox.GroupLabel`. */
export type ComboboxGroupLabelProps = ComponentProps<typeof BaseCombobox.GroupLabel>;

export function ComboboxGroupLabel({ className, ...rest }: ComboboxGroupLabelProps) {
  return (
    <BaseCombobox.GroupLabel
      data-pharos-slot="combobox-group-label"
      className={cn(styles.label, className)}
      {...rest}
    />
  );
}

ComboboxGroupLabel.displayName = 'ComboboxGroupLabel';

/** A thin divider between groups of results. Wraps `Combobox.Separator`. */
export type ComboboxSeparatorProps = ComponentProps<typeof BaseCombobox.Separator>;

export function ComboboxSeparator({ className, ...rest }: ComboboxSeparatorProps) {
  return (
    <BaseCombobox.Separator
      data-pharos-slot="combobox-separator"
      className={cn(styles.separator, className)}
      {...rest}
    />
  );
}

ComboboxSeparator.displayName = 'ComboboxSeparator';
