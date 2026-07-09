import type { ComponentProps, ComponentPropsWithoutRef } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import styles from './Sheet.module.css';

/**
 * Modal panel that docks to a viewport edge and slides in (the shadcn
 * **Sheet** contract). Wraps Base UI's `Dialog.*`, which implements the ARIA
 * **dialog** pattern as a **modal** disclosure: `role="dialog"` +
 * `aria-modal`, focus trapped inside the panel, scroll locked, Escape and
 * backdrop-click dismiss, focus returns to the trigger on close.
 *
 * Distinct from `Popover` (D16, non-modal, anchored to its trigger) and
 * `DropdownMenu` (D15, menu-button). A Sheet is for a task surface that
 * should command the screen — mobile navigation, a filters panel, a
 * create/edit form. Naming follows shadcn (`Sheet*`); the compound surface
 * collapses Base UI's `Portal` + `Backdrop` + `Popup` into a single
 * `SheetContent` with a `side` prop, mirroring the ergonomics of the other
 * Pharos overlays.
 *
 * v1 ships the parts the known consumers need (the LanguageSelector /
 * MobileDrawer): Trigger, Content, Header, Footer, Title, Description, Close.
 *
 * @example
 * <Sheet>
 *   <SheetTrigger render={<Button intent="secondary">Menu</Button>} />
 *   <SheetContent side="left">
 *     <SheetHeader>
 *       <SheetTitle>Navigation</SheetTitle>
 *       <SheetDescription>Jump to a section.</SheetDescription>
 *     </SheetHeader>
 *     <nav>…</nav>
 *     <SheetFooter>
 *       <SheetClose render={<Button intent="ghost">Close</Button>} />
 *     </SheetFooter>
 *   </SheetContent>
 * </Sheet>
 */
export type SheetProps = ComponentProps<typeof Dialog.Root>;

export function Sheet(props: SheetProps) {
  return <Dialog.Root {...props} />;
}

Sheet.displayName = 'Sheet';

/**
 * The element that opens the sheet. Renders a native `<button>` by default;
 * pass `render` to compose any control (`render={<Button…/>}`,
 * `render={<IconButton…/>}`).
 */
export type SheetTriggerProps = ComponentProps<typeof Dialog.Trigger>;

export function SheetTrigger(props: SheetTriggerProps) {
  return <Dialog.Trigger {...props} />;
}

SheetTrigger.displayName = 'SheetTrigger';

const sheetVariants = cva(styles.content, {
  variants: {
    side: {
      top: styles.sideTop,
      right: styles.sideRight,
      bottom: styles.sideBottom,
      left: styles.sideLeft,
    },
  },
  defaultVariants: {
    side: 'right',
  },
});

type SheetVariantProps = VariantProps<typeof sheetVariants>;

/**
 * The panel surface. Collapses Base UI's `Portal` + `Backdrop` + `Popup`. The
 * `side` prop docks it to one of the four viewport edges (default `right`)
 * and picks the matching slide-in transition. The backdrop and panel share
 * the `--pharos-z-index-popover` overlay layer so a Select / Popover opened
 * from inside the sheet still stacks above it (portal open order).
 */
export interface SheetContentProps extends ComponentProps<typeof Dialog.Popup>, SheetVariantProps {}

export function SheetContent({ side = 'right', className, children, ...rest }: SheetContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop className={styles.backdrop} />
      <Dialog.Popup
        data-pharos-slot="sheet-content"
        data-pharos-side={side ?? 'right'}
        className={cn(sheetVariants({ side }), className)}
        {...rest}
      >
        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  );
}

SheetContent.displayName = 'SheetContent';

/** Groups the title + description at the top of the panel. */
export interface SheetHeaderProps extends ComponentPropsWithoutRef<'div'> {}

export function SheetHeader({ className, ...rest }: SheetHeaderProps) {
  return <div data-pharos-slot="sheet-header" className={cn(styles.header, className)} {...rest} />;
}

SheetHeader.displayName = 'SheetHeader';

/**
 * The panel's accessible name. Renders Base UI's `Dialog.Title`, which wires
 * `aria-labelledby` on the popup — required for the dialog to be announced.
 * Renders as an `<h2>` by default.
 */
export type SheetTitleProps = ComponentProps<typeof Dialog.Title>;

export function SheetTitle({ className, ...rest }: SheetTitleProps) {
  return (
    <Dialog.Title
      data-pharos-slot="sheet-title"
      className={cn(styles.title, className)}
      {...rest}
    />
  );
}

SheetTitle.displayName = 'SheetTitle';

/**
 * Supporting copy under the title. Renders Base UI's `Dialog.Description`,
 * which wires `aria-describedby` on the popup. Renders as a `<p>` by default.
 */
export type SheetDescriptionProps = ComponentProps<typeof Dialog.Description>;

export function SheetDescription({ className, ...rest }: SheetDescriptionProps) {
  return (
    <Dialog.Description
      data-pharos-slot="sheet-description"
      className={cn(styles.description, className)}
      {...rest}
    />
  );
}

SheetDescription.displayName = 'SheetDescription';

/** Bottom action row, pushed to the panel's end. */
export interface SheetFooterProps extends ComponentPropsWithoutRef<'div'> {}

export function SheetFooter({ className, ...rest }: SheetFooterProps) {
  return <div data-pharos-slot="sheet-footer" className={cn(styles.footer, className)} {...rest} />;
}

SheetFooter.displayName = 'SheetFooter';

/**
 * A button that closes the sheet. Renders Base UI's `Dialog.Close` (a native
 * `<button>`); compose any control via `render`.
 */
export type SheetCloseProps = ComponentProps<typeof Dialog.Close>;

export function SheetClose(props: SheetCloseProps) {
  return <Dialog.Close data-pharos-slot="sheet-close" {...props} />;
}

SheetClose.displayName = 'SheetClose';

export { sheetVariants };
