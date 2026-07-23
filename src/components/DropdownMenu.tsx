'use client';

import type { ComponentProps } from 'react';
import { Menu } from '@base-ui/react/menu';
import { cn } from '../lib/cn';
import styles from './DropdownMenu.module.css';

/**
 * Action menu anchored to a trigger (Decision D15). Wraps Base UI's
 * `Menu.*` parts, which implement the ARIA APG **menu button** pattern:
 * `role="menu"` / `menuitem`, roving focus, arrow-key navigation,
 * typeahead, and Escape-to-close with focus return to the trigger.
 *
 * This is deliberately distinct from a future `Popover` atom. A
 * DropdownMenu is for **commands** (the menu-button contract); free-form
 * anchored content (forms, navigation links) belongs in a Popover (the
 * disclosure/dialog contract). 7 of 8 surveyed design systems separate
 * the two for exactly this reason — putting `role="menu"` around
 * arbitrary content breaks screen-reader expectations. See
 * `NAMING-decisions.md` § DropdownMenu.
 *
 * Naming follows shadcn (`DropdownMenu*`, not Base UI's `Menu`). The
 * compound surface collapses Base UI's `Portal` + `Positioner` + `Popup`
 * into a single `DropdownMenuContent` with `side` / `align` /
 * `sideOffset` props — the same ergonomics shadcn exposes over Radix.
 *
 * v1 ships the parts the known consumers need (kebab row menus, the
 * MobileHeader user actions): Trigger, Content, Item, Separator, Label,
 * Group. `CheckboxItem`, `RadioItem`, submenus and `LinkItem` are
 * deliberately deferred — no Alexandria call-site exercises them, and the
 * compound API makes them additive without a breaking change.
 *
 * @example
 * <DropdownMenu>
 *   <DropdownMenuTrigger render={<IconButton aria-label="Options"><MoreIcon /></IconButton>} />
 *   <DropdownMenuContent>
 *     <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
 *     <DropdownMenuSeparator />
 *     <DropdownMenuItem variant="destructive" onClick={onDelete}>Delete</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 */
export type DropdownMenuProps = ComponentProps<typeof Menu.Root>;

export function DropdownMenu(props: DropdownMenuProps) {
  return <Menu.Root {...props} />;
}

DropdownMenu.displayName = 'DropdownMenu';

/**
 * The element that opens the menu. Renders a native `<button>` by
 * default; pass `render` to compose any control while keeping the menu
 * wiring — the dominant case is the kebab `IconButton` (D13):
 * `<DropdownMenuTrigger render={<IconButton aria-label="Options"><MoreIcon /></IconButton>} />`.
 */
export type DropdownMenuTriggerProps = ComponentProps<typeof Menu.Trigger>;

export function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
  return <Menu.Trigger {...props} />;
}

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

/**
 * The floating surface. Collapses Base UI's `Portal` + `Positioner` +
 * `Popup` so the consumer positions the menu with the three props that
 * actually matter at the call site. Defaults match the common dropdown:
 * opens below the trigger, aligned to its start edge, 8px away.
 */
export interface DropdownMenuContentProps extends ComponentProps<typeof Menu.Popup> {
  /**
   * Which side of the trigger the menu opens on.
   * @default 'bottom'
   */
  side?: ComponentProps<typeof Menu.Positioner>['side'];
  /**
   * Alignment of the menu relative to the trigger along the chosen side.
   * @default 'start'
   */
  align?: ComponentProps<typeof Menu.Positioner>['align'];
  /**
   * Gap in pixels between the trigger and the menu.
   * @default 8
   */
  sideOffset?: ComponentProps<typeof Menu.Positioner>['sideOffset'];
}

export function DropdownMenuContent({
  side = 'bottom',
  align = 'start',
  sideOffset = 8,
  className,
  children,
  ...rest
}: DropdownMenuContentProps) {
  return (
    <Menu.Portal>
      <Menu.Positioner
        className={styles.positioner}
        side={side}
        align={align}
        sideOffset={sideOffset}
      >
        <Menu.Popup
          data-pharos-slot="dropdown-menu-content"
          className={cn(styles.content, className)}
          {...rest}
        >
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}

DropdownMenuContent.displayName = 'DropdownMenuContent';

/**
 * A single action row. `variant="destructive"` tints the row with the
 * error foreground for delete / remove actions — the same tone the
 * destructive Button uses, and the equivalent of shadcn's destructive
 * item variant. By default a click closes the menu (`closeOnClick`);
 * pass `closeOnClick={false}` for rows that should keep it open.
 */
export interface DropdownMenuItemProps extends ComponentProps<typeof Menu.Item> {
  /**
   * Visual tone of the row.
   * @default 'default'
   */
  variant?: 'default' | 'destructive';
}

export function DropdownMenuItem({
  variant = 'default',
  className,
  ...rest
}: DropdownMenuItemProps) {
  return (
    <Menu.Item
      data-pharos-variant={variant}
      className={cn(styles.item, variant === 'destructive' && styles.itemDestructive, className)}
      {...rest}
    />
  );
}

DropdownMenuItem.displayName = 'DropdownMenuItem';

/** A thin divider between groups of items. */
export type DropdownMenuSeparatorProps = ComponentProps<typeof Menu.Separator>;

export function DropdownMenuSeparator({ className, ...rest }: DropdownMenuSeparatorProps) {
  return (
    <Menu.Separator
      data-pharos-slot="dropdown-menu-separator"
      className={cn(styles.separator, className)}
      {...rest}
    />
  );
}

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

/**
 * A non-interactive heading for a group of items. Renders Base UI's
 * `Menu.GroupLabel`, which wires `aria-labelledby` on the surrounding
 * `DropdownMenuGroup` — so use the two together when a section needs an
 * accessible name.
 */
export type DropdownMenuLabelProps = ComponentProps<typeof Menu.GroupLabel>;

export function DropdownMenuLabel({ className, ...rest }: DropdownMenuLabelProps) {
  return (
    <Menu.GroupLabel
      data-pharos-slot="dropdown-menu-label"
      className={cn(styles.label, className)}
      {...rest}
    />
  );
}

DropdownMenuLabel.displayName = 'DropdownMenuLabel';

/**
 * Groups related items under an optional `DropdownMenuLabel` for
 * accessible sectioning (`role="group"`).
 */
export type DropdownMenuGroupProps = ComponentProps<typeof Menu.Group>;

export function DropdownMenuGroup(props: DropdownMenuGroupProps) {
  return <Menu.Group data-pharos-slot="dropdown-menu-group" {...props} />;
}

DropdownMenuGroup.displayName = 'DropdownMenuGroup';
