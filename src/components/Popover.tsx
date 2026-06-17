import type { ComponentProps } from 'react';
import { Popover as BasePopover } from '@base-ui/react/popover';
import { cn } from '../lib/cn';
import styles from './Popover.module.css';

/**
 * Free-form content anchored to a trigger (Decision D16). Wraps Base UI's
 * `Popover.*` parts, which implement the ARIA **dialog** pattern in a
 * **non-modal** disclosure: `role="dialog"` on the popup, focus moves into
 * it on open and returns to the trigger on close, Escape and outside-click
 * dismiss it — but focus is NOT trapped and the rest of the page stays
 * interactive.
 *
 * This is deliberately distinct from the `DropdownMenu` atom (D15). A
 * DropdownMenu is for **commands** (the menu-button contract: `role="menu"`
 * / `menuitem`, roving focus, typeahead); a Popover holds **arbitrary
 * content** — forms, navigation, descriptive panels. 7 of 8 surveyed design
 * systems separate the two for exactly this reason: wrapping `role="menu"`
 * around free-form content breaks screen-reader expectations. The two atoms
 * wrap different Base UI primitives (`Menu` vs `Popover`) — they do not
 * share machinery. See `NAMING-decisions.md` § Popover.
 *
 * Naming follows shadcn (`Popover*`). The compound surface collapses Base
 * UI's `Portal` + `Positioner` + `Popup` into a single `PopoverContent`
 * with `side` / `align` / `sideOffset` / `alignOffset` props — the same
 * ergonomics shadcn exposes over Radix, mirroring the Pharos DropdownMenu.
 *
 * v1 ships the parts the known consumers need (the MobileHeader user panel,
 * the "add users" / "add skills" panels): Trigger, Content, Close, Title,
 * Description. `Arrow`, an `Anchor` (anchoring to an element other than the
 * trigger — the future Combobox will want it) and a modal `Backdrop` are
 * deliberately deferred; the compound API makes them additive without a
 * breaking change.
 *
 * @example
 * <Popover>
 *   <PopoverTrigger render={<IconButton aria-label="Account"><Avatar … /></IconButton>} />
 *   <PopoverContent>
 *     <PopoverTitle>Signed in as Ada</PopoverTitle>
 *     <PopoverDescription>ada@example.com</PopoverDescription>
 *     <button onClick={onSignOut}>Sign out</button>
 *   </PopoverContent>
 * </Popover>
 */
export type PopoverProps = ComponentProps<typeof BasePopover.Root>;

export function Popover(props: PopoverProps) {
  return <BasePopover.Root {...props} />;
}

Popover.displayName = 'Popover';

/**
 * The element that opens the popover. Renders a native `<button>` by
 * default; pass `render` to compose any control while keeping the popover
 * wiring — e.g. the MobileHeader avatar:
 * `<PopoverTrigger render={<IconButton aria-label="Account">…</IconButton>} />`.
 */
export type PopoverTriggerProps = ComponentProps<typeof BasePopover.Trigger>;

export function PopoverTrigger(props: PopoverTriggerProps) {
  return <BasePopover.Trigger {...props} />;
}

PopoverTrigger.displayName = 'PopoverTrigger';

/**
 * The floating surface. Collapses Base UI's `Portal` + `Positioner` +
 * `Popup` so the consumer positions the popover with the four props that
 * actually matter at the call site. Defaults match the common popover:
 * opens below the trigger, centred on it, 8px away.
 *
 * `align` defaults to `center` (not `start` like DropdownMenu): a menu opens
 * flush to the trigger's start edge, but a popover carries arbitrary content
 * and reads better centred — the shadcn / Radix / Base UI default.
 */
export interface PopoverContentProps extends ComponentProps<typeof BasePopover.Popup> {
  /**
   * Which side of the trigger the popover opens on.
   * @default 'bottom'
   */
  side?: ComponentProps<typeof BasePopover.Positioner>['side'];
  /**
   * Alignment of the popover relative to the trigger along the chosen side.
   * @default 'center'
   */
  align?: ComponentProps<typeof BasePopover.Positioner>['align'];
  /**
   * Gap in pixels between the trigger and the popover.
   * @default 8
   */
  sideOffset?: ComponentProps<typeof BasePopover.Positioner>['sideOffset'];
  /**
   * Offset in pixels along the alignment axis.
   * @default 0
   */
  alignOffset?: ComponentProps<typeof BasePopover.Positioner>['alignOffset'];
}

export function PopoverContent({
  side = 'bottom',
  align = 'center',
  sideOffset = 8,
  alignOffset = 0,
  className,
  children,
  ...rest
}: PopoverContentProps) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner
        className={styles.positioner}
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
      >
        <BasePopover.Popup
          data-pharos-slot="popover-content"
          className={cn(styles.content, className)}
          {...rest}
        >
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}

PopoverContent.displayName = 'PopoverContent';

/**
 * An accessible name for the popover. Renders Base UI's `Popover.Title`,
 * which wires `aria-labelledby` on the popup — the dialog labelling that
 * distinguishes a Popover from a Menu. Renders as a `<h2>` by default; pass
 * `render` to change the element.
 */
export type PopoverTitleProps = ComponentProps<typeof BasePopover.Title>;

export function PopoverTitle({ className, ...rest }: PopoverTitleProps) {
  return (
    <BasePopover.Title
      data-pharos-slot="popover-title"
      className={cn(styles.title, className)}
      {...rest}
    />
  );
}

PopoverTitle.displayName = 'PopoverTitle';

/**
 * A supporting description for the popover. Renders Base UI's
 * `Popover.Description`, which wires `aria-describedby` on the popup.
 * Renders as a `<p>` by default.
 */
export type PopoverDescriptionProps = ComponentProps<typeof BasePopover.Description>;

export function PopoverDescription({ className, ...rest }: PopoverDescriptionProps) {
  return (
    <BasePopover.Description
      data-pharos-slot="popover-description"
      className={cn(styles.description, className)}
      {...rest}
    />
  );
}

PopoverDescription.displayName = 'PopoverDescription';

/**
 * A button that closes the popover. Renders Base UI's `Popover.Close` (a
 * native `<button>`); compose any control via `render`. Unlike a menu — whose
 * items close it on selection — a popover holds content that stays open until
 * explicitly dismissed, so an in-popup close affordance is the common case.
 */
export type PopoverCloseProps = ComponentProps<typeof BasePopover.Close>;

export function PopoverClose(props: PopoverCloseProps) {
  return <BasePopover.Close data-pharos-slot="popover-close" {...props} />;
}

PopoverClose.displayName = 'PopoverClose';
