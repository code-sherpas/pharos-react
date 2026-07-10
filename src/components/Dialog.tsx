import type { ComponentProps, ComponentPropsWithoutRef } from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { cn } from '../lib/cn';
import styles from './Dialog.module.css';

/**
 * Centered modal panel (the shadcn **Dialog** contract). Wraps Base UI's
 * `Dialog.*`, which implements the ARIA **dialog** pattern as a **modal**
 * disclosure: `role="dialog"` + `aria-modal`, focus trapped inside the panel,
 * scroll locked, Escape and backdrop-click dismiss, focus returns to the
 * trigger on close.
 *
 * Sibling of `Sheet` (D18): both wrap the same Base UI `Dialog` primitive.
 * Dialog is the **centered** modal (confirmations, short forms, focused
 * tasks); Sheet is the **edge-docked** panel. Distinct from `Popover` (D16,
 * non-modal, anchored) and `DropdownMenu` (D15, menu-button). Naming follows
 * shadcn (`Dialog*`); `DialogContent` collapses Base UI's `Portal` +
 * `Backdrop` + `Popup` into one part, mirroring the other Pharos overlays.
 *
 * @example
 * <Dialog>
 *   <DialogTrigger render={<Button intent="destructive">Delete</Button>} />
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Delete project?</DialogTitle>
 *       <DialogDescription>This cannot be undone.</DialogDescription>
 *     </DialogHeader>
 *     <DialogFooter>
 *       <DialogClose render={<Button intent="ghost">Cancel</Button>} />
 *       <Button intent="destructive" onClick={onDelete}>Delete</Button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 */
export type DialogProps = ComponentProps<typeof BaseDialog.Root>;

export function Dialog(props: DialogProps) {
  return <BaseDialog.Root {...props} />;
}

Dialog.displayName = 'Dialog';

/**
 * The element that opens the dialog. Renders a native `<button>` by default;
 * pass `render` to compose any control (`render={<Button…/>}`).
 */
export type DialogTriggerProps = ComponentProps<typeof BaseDialog.Trigger>;

export function DialogTrigger(props: DialogTriggerProps) {
  return <BaseDialog.Trigger {...props} />;
}

DialogTrigger.displayName = 'DialogTrigger';

/**
 * The centered panel. Collapses Base UI's `Portal` + `Backdrop` + `Popup`. The
 * backdrop and panel share the `--pharos-z-index-popover` overlay layer so a
 * Select / Popover opened from inside the dialog still stacks above it (portal
 * open order).
 */
export interface DialogContentProps extends ComponentProps<typeof BaseDialog.Popup> {}

export function DialogContent({ className, children, ...rest }: DialogContentProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={styles.backdrop} />
      <BaseDialog.Popup
        data-pharos-slot="dialog-content"
        className={cn(styles.content, className)}
        {...rest}
      >
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

DialogContent.displayName = 'DialogContent';

/** Groups the title + description at the top of the panel. */
export interface DialogHeaderProps extends ComponentPropsWithoutRef<'div'> {}

export function DialogHeader({ className, ...rest }: DialogHeaderProps) {
  return (
    <div data-pharos-slot="dialog-header" className={cn(styles.header, className)} {...rest} />
  );
}

DialogHeader.displayName = 'DialogHeader';

/**
 * The dialog's accessible name. Renders Base UI's `Dialog.Title`, which wires
 * `aria-labelledby` on the popup — required for the dialog to be announced.
 * Renders as an `<h2>` by default.
 */
export type DialogTitleProps = ComponentProps<typeof BaseDialog.Title>;

export function DialogTitle({ className, ...rest }: DialogTitleProps) {
  return (
    <BaseDialog.Title
      data-pharos-slot="dialog-title"
      className={cn(styles.title, className)}
      {...rest}
    />
  );
}

DialogTitle.displayName = 'DialogTitle';

/**
 * Supporting copy under the title. Renders Base UI's `Dialog.Description`,
 * which wires `aria-describedby` on the popup. Renders as a `<p>` by default.
 */
export type DialogDescriptionProps = ComponentProps<typeof BaseDialog.Description>;

export function DialogDescription({ className, ...rest }: DialogDescriptionProps) {
  return (
    <BaseDialog.Description
      data-pharos-slot="dialog-description"
      className={cn(styles.description, className)}
      {...rest}
    />
  );
}

DialogDescription.displayName = 'DialogDescription';

/** Bottom action row, pushed to the panel's end. */
export interface DialogFooterProps extends ComponentPropsWithoutRef<'div'> {}

export function DialogFooter({ className, ...rest }: DialogFooterProps) {
  return (
    <div data-pharos-slot="dialog-footer" className={cn(styles.footer, className)} {...rest} />
  );
}

DialogFooter.displayName = 'DialogFooter';

/**
 * A button that closes the dialog. Renders Base UI's `Dialog.Close` (a native
 * `<button>`); compose any control via `render`.
 */
export type DialogCloseProps = ComponentProps<typeof BaseDialog.Close>;

export function DialogClose(props: DialogCloseProps) {
  return <BaseDialog.Close data-pharos-slot="dialog-close" {...props} />;
}

DialogClose.displayName = 'DialogClose';
