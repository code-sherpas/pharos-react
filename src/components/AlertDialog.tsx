'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type Ref,
  type RefObject,
} from 'react';
import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog';
import { Button, type ButtonProps } from './Button.js';
import { Spinner } from './Spinner.js';
import { cn } from '../lib/cn.js';
// Same look as Dialog (decision 9 of the AlertDialog task: no new tokens, the
// appearance is Dialog's). One stylesheet for both keeps them from drifting.
import styles from './Dialog.module.css';

/**
 * A modal confirmation (the shadcn **AlertDialog** contract). Wraps Base UI's
 * `AlertDialog.*`, which implements the ARIA APG **alertdialog** pattern:
 * `role="alertdialog"` + `aria-modal`, named by its title and described by its
 * description, focus trapped inside, scroll locked, focus returned to the
 * trigger on close.
 *
 * What makes it a confirmation rather than a `Dialog`:
 * - **Focus starts on `AlertDialogCancel`**, so pressing Enter right after it
 *   opens never confirms. Pass `initialFocus` to `AlertDialogContent` to move it.
 * - **A click outside does nothing**: it neither closes nor confirms.
 * - **Escape equals Cancel**: both close and reach `onOpenChange(false)`.
 *   Escape does not run Cancel's `onClick`; put a cancel side effect in
 *   `onOpenChange`.
 * - **`AlertDialogAction` confirms and closes**, unless its `onClick` calls
 *   `event.preventDefault()`: then the confirmation stays open.
 * - **`pending`** marks the operation in progress: Escape, Cancel and any
 *   other close do nothing, Action is `aria-disabled` (still focusable) with a
 *   Spinner hidden from screen readers, and the panel carries `aria-busy`.
 *
 * The asynchronous pattern: control `open`; in Action's `onClick` call
 * `event.preventDefault()` and set `pending`; when the operation ends, clear
 * `pending` and set `open` to `false` (focus goes back to the trigger). If it
 * fails, clear `pending` and keep it open. Pharos adds no text: the "in
 * progress" message (in a `role="status"` region) and the error (in a
 * `role="alert"` region) are composed by the consumer inside the content.
 *
 * Use it for every confirmation, destructive (`intent="destructive"` on the
 * action) or not (`intent="primary"`).
 *
 * @example
 * <AlertDialog>
 *   <AlertDialogTrigger render={<Button intent="destructive">Delete</Button>} />
 *   <AlertDialogContent>
 *     <AlertDialogHeader>
 *       <AlertDialogTitle>Delete project?</AlertDialogTitle>
 *       <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
 *     </AlertDialogHeader>
 *     <AlertDialogFooter>
 *       <AlertDialogCancel>Cancel</AlertDialogCancel>
 *       <AlertDialogAction intent="destructive" onClick={onDelete}>Delete</AlertDialogAction>
 *     </AlertDialogFooter>
 *   </AlertDialogContent>
 * </AlertDialog>
 */
export interface AlertDialogProps extends ComponentProps<typeof BaseAlertDialog.Root> {
  /**
   * The confirmed operation is in progress. While `true`, nothing closes the
   * confirmation (Escape, Cancel, Action): `onOpenChange` is not called with
   * `false`. Action is `aria-disabled` and shows a Spinner hidden from screen
   * readers; the panel carries `aria-busy`. The consumer controls it and
   * announces the progress itself, inside the content.
   *
   * @default false
   */
  pending?: boolean;
}

type OpenChangeDetails = Parameters<NonNullable<AlertDialogProps['onOpenChange']>>[1];

/**
 * Whether the operation is in progress, for the parts that change with it.
 * Internal: not exported from the package.
 */
const PendingContext = createContext(false);

export function AlertDialog({ pending = false, onOpenChange, ...rest }: AlertDialogProps) {
  /** While pending, every request to close is refused before it reaches the consumer. */
  function keepOpenWhilePending(open: boolean, details: OpenChangeDetails): void {
    if (pending && !open) {
      details.cancel();
      return;
    }
    onOpenChange?.(open, details);
  }

  return (
    <PendingContext.Provider value={pending}>
      <BaseAlertDialog.Root onOpenChange={keepOpenWhilePending} {...rest} />
    </PendingContext.Provider>
  );
}

AlertDialog.displayName = 'AlertDialog';

/**
 * The element that opens the confirmation. Renders a native `<button>` by
 * default; pass `render` to compose any control (`render={<Button…/>}`). When
 * the confirmation opens from somewhere a trigger cannot live (a menu item),
 * control `AlertDialog` with `open` / `onOpenChange` instead.
 */
export type AlertDialogTriggerProps = ComponentProps<typeof BaseAlertDialog.Trigger>;

export function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  return <BaseAlertDialog.Trigger {...props} />;
}

AlertDialogTrigger.displayName = 'AlertDialogTrigger';

/**
 * Where `AlertDialogCancel` registers itself, so `AlertDialogContent` can move
 * the initial focus to it. Internal: not exported from the package.
 */
const CancelRefContext = createContext<RefObject<HTMLElement | null> | null>(null);

/**
 * The centered panel. Collapses Base UI's `Portal` + `Backdrop` + `Popup`, like
 * `DialogContent`, on the same `--pharos-z-index-modal` layer (D29). Focus
 * starts on `AlertDialogCancel`; `initialFocus` overrides it.
 */
export interface AlertDialogContentProps extends ComponentProps<typeof BaseAlertDialog.Popup> {}

export function AlertDialogContent({
  className,
  children,
  initialFocus,
  ...rest
}: AlertDialogContentProps) {
  const cancelRef = useRef<HTMLElement | null>(null);
  const pending = useContext(PendingContext);

  /** Cancel when it is there; otherwise Base UI's default (the first tabbable). */
  function focusCancel(): HTMLElement | boolean {
    return cancelRef.current ?? true;
  }

  return (
    <BaseAlertDialog.Portal>
      <BaseAlertDialog.Backdrop className={styles.backdrop} />
      <BaseAlertDialog.Popup
        data-pharos-slot="alert-dialog-content"
        className={cn(styles.content, className)}
        initialFocus={initialFocus ?? focusCancel}
        aria-busy={pending || undefined}
        {...rest}
      >
        <CancelRefContext.Provider value={cancelRef}>{children}</CancelRefContext.Provider>
      </BaseAlertDialog.Popup>
    </BaseAlertDialog.Portal>
  );
}

AlertDialogContent.displayName = 'AlertDialogContent';

/** Groups the title + description at the top of the panel. */
export interface AlertDialogHeaderProps extends ComponentPropsWithoutRef<'div'> {}

export function AlertDialogHeader({ className, ...rest }: AlertDialogHeaderProps) {
  return (
    <div
      data-pharos-slot="alert-dialog-header"
      className={cn(styles.header, className)}
      {...rest}
    />
  );
}

AlertDialogHeader.displayName = 'AlertDialogHeader';

/**
 * The confirmation's accessible name: what is about to happen. Wires
 * `aria-labelledby` on the panel. Renders as an `<h2>` by default.
 */
export type AlertDialogTitleProps = ComponentProps<typeof BaseAlertDialog.Title>;

export function AlertDialogTitle({ className, ...rest }: AlertDialogTitleProps) {
  return (
    <BaseAlertDialog.Title
      data-pharos-slot="alert-dialog-title"
      className={cn(styles.title, className)}
      {...rest}
    />
  );
}

AlertDialogTitle.displayName = 'AlertDialogTitle';

/**
 * What confirming means (its consequences). Wires `aria-describedby` on the
 * panel, so a screen reader reads it with the title. Renders as a `<p>`.
 */
export type AlertDialogDescriptionProps = ComponentProps<typeof BaseAlertDialog.Description>;

export function AlertDialogDescription({ className, ...rest }: AlertDialogDescriptionProps) {
  return (
    <BaseAlertDialog.Description
      data-pharos-slot="alert-dialog-description"
      className={cn(styles.description, className)}
      {...rest}
    />
  );
}

AlertDialogDescription.displayName = 'AlertDialogDescription';

/** Bottom row holding Cancel and Action, pushed to the panel's end. */
export interface AlertDialogFooterProps extends ComponentPropsWithoutRef<'div'> {}

export function AlertDialogFooter({ className, ...rest }: AlertDialogFooterProps) {
  return (
    <div
      data-pharos-slot="alert-dialog-footer"
      className={cn(styles.footer, className)}
      {...rest}
    />
  );
}

AlertDialogFooter.displayName = 'AlertDialogFooter';

type CloseProps = Omit<ComponentProps<typeof BaseAlertDialog.Close>, 'render' | 'nativeButton'>;
type CloseClickEvent = Parameters<NonNullable<CloseProps['onClick']>>[0];

/**
 * Confirms and closes. A `Button` (accepts its `intent` and `size`): use
 * `intent="destructive"` for a deletion, `intent="primary"` (the default) for a
 * confirmation that destroys nothing, such as publishing.
 *
 * Calling `event.preventDefault()` in `onClick` keeps the confirmation open:
 * the start of the asynchronous pattern (see `AlertDialog`'s `pending`). While
 * pending it is `aria-disabled`, stays focusable, ignores presses (`onClick`
 * does not run) and shows a Spinner hidden from screen readers.
 */
export interface AlertDialogActionProps extends CloseProps, Pick<ButtonProps, 'intent' | 'size'> {}

export function AlertDialogAction({
  intent,
  size,
  onClick,
  children,
  ...rest
}: AlertDialogActionProps) {
  const pending = useContext(PendingContext);

  /**
   * Runs the consumer's `onClick`, then closes unless it called
   * `preventDefault()`: Base UI closes regardless, so the default is
   * translated into stopping its handler.
   */
  function confirm(event: CloseClickEvent): void {
    if (pending) {
      event.preventBaseUIHandler();
      return;
    }
    onClick?.(event);
    if (event.defaultPrevented) event.preventBaseUIHandler();
  }

  return (
    <BaseAlertDialog.Close
      data-pharos-slot="alert-dialog-action"
      render={<Button intent={intent ?? 'primary'} size={size} />}
      aria-disabled={pending || undefined}
      onClick={confirm}
      {...rest}
    >
      {pending && <Spinner size={size === 'lg' ? 'md' : 'sm'} aria-hidden="true" />}
      {children}
    </BaseAlertDialog.Close>
  );
}

AlertDialogAction.displayName = 'AlertDialogAction';

/**
 * Backs out and closes. A `Button` (`intent="secondary"` by default). Focus
 * starts here when the confirmation opens; Escape does the same as clicking it.
 * While `pending`, it is `aria-disabled` and ignores presses: there is nothing
 * to back out of once the operation has started.
 */
export interface AlertDialogCancelProps extends CloseProps, Pick<ButtonProps, 'intent' | 'size'> {}

export function AlertDialogCancel({ intent, size, ref, onClick, ...rest }: AlertDialogCancelProps) {
  const cancelRef = useContext(CancelRefContext);
  const pending = useContext(PendingContext);
  const setRefs = useCallback(
    function registerCancel(node: HTMLButtonElement | null) {
      if (cancelRef) cancelRef.current = node;
      assignRef(ref, node);
    },
    [cancelRef, ref],
  );

  /** Backs out, unless the operation is already in progress. */
  function cancel(event: CloseClickEvent): void {
    if (pending) {
      event.preventBaseUIHandler();
      return;
    }
    onClick?.(event);
  }

  return (
    <BaseAlertDialog.Close
      data-pharos-slot="alert-dialog-cancel"
      ref={setRefs}
      render={<Button intent={intent ?? 'secondary'} size={size} />}
      aria-disabled={pending || undefined}
      onClick={cancel}
      {...rest}
    />
  );
}

AlertDialogCancel.displayName = 'AlertDialogCancel';

/** Hands `node` to a consumer's ref, whichever of the two shapes it has. */
function assignRef<T>(ref: Ref<T> | undefined, node: T | null): void {
  if (typeof ref === 'function') ref(node);
  else if (ref) ref.current = node;
}
