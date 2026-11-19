'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type Ref,
} from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { tokens } from '@code-sherpas/pharos-tokens';
import { cn } from '../lib/cn';
import styles from './Dialog.module.css';

/**
 * Centered modal panel (the shadcn **Dialog** contract). Wraps Base UI's
 * `Dialog.*`, which implements the ARIA **dialog** pattern as a **modal**
 * disclosure: `role="dialog"` + `aria-modal`, focus trapped inside the panel,
 * scroll locked, Escape and backdrop-click dismiss, focus returns to the
 * trigger on close.
 *
 * Below the compact width (`breakpoint.compact` in pharos-tokens, a phone's)
 * the same panel fills the screen: no margin, no radius, the header at the top
 * and the footer at the bottom always in view, and only what sits between them
 * scrolls. Crossing the breakpoint with the dialog open only restyles it: it
 * is the same element, so what was typed and the focus stay where they were.
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
 * The form the panel takes: `centered` from the compact breakpoint up,
 * `fullscreen` below it. Mirrored on `data-pharos-mode`.
 */
type DialogMode = 'centered' | 'fullscreen';

/**
 * Below the compact width the panel fills the screen. The breakpoint comes from
 * pharos-tokens (D32); a custom property does not work inside `@media`, so it
 * is read here with `matchMedia` and the CSS keys off `data-pharos-mode`.
 */
const COMPACT_QUERY = `not all and (min-width: ${tokens.breakpoint.compact})`;

function canMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

function readCompactMatch(): boolean {
  return canMatchMedia() && window.matchMedia(COMPACT_QUERY).matches;
}

/**
 * The server has no viewport: it renders the centered form, and the browser
 * corrects it right after hydration without a mismatch.
 */
function readServerCompactMatch(): boolean {
  return false;
}

function subscribeToCompactWidth(notify: () => void): () => void {
  if (!canMatchMedia()) return function noop() {};
  const query = window.matchMedia(COMPACT_QUERY);
  query.addEventListener('change', notify);
  return function unsubscribe() {
    query.removeEventListener('change', notify);
  };
}

// `useLayoutEffect` warns during server rendering on React 18; the effect
// only matters in the browser.
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** The form the panel takes at the current viewport width. */
function useDialogMode(): DialogMode {
  const compact = useSyncExternalStore(
    subscribeToCompactWidth,
    readCompactMatch,
    readServerCompactMatch,
  );
  return compact ? 'fullscreen' : 'centered';
}

/**
 * The panel. Collapses Base UI's `Portal` + `Backdrop` + `Popup`. Centered from
 * the compact breakpoint up; below it, full screen with the header and footer
 * pinned and the rest scrolling between them (`data-pharos-mode`). The
 * backdrop and panel share the `--pharos-z-index-modal` layer (D29): a modal
 * opened over the dialog paints above it by portal order, and a Select /
 * Popover opened from inside it sits on the higher popover layer.
 */
export interface DialogContentProps extends ComponentProps<typeof BaseDialog.Popup> {}

/**
 * Full screen, the header and the footer stick over the scrolling body. A
 * field the keyboard reaches while it sits under one of them is still inside
 * the scroll container, so the browser would not scroll it into view and it
 * would stay hidden (WCAG 2.4.11). Their sizes become the panel's
 * `scroll-padding`, which the browser honours when it reveals the focus.
 */
function usePinnedEdgesScrollPadding(popup: HTMLElement | null, mode: DialogMode): void {
  useEffect(
    function padForPinnedEdges() {
      if (
        popup === null ||
        mode !== 'fullscreen' ||
        typeof ResizeObserver === 'undefined' ||
        typeof MutationObserver === 'undefined'
      ) {
        return;
      }
      const panel = popup;
      let header: HTMLElement | null = null;
      let footer: HTMLElement | null = null;
      function measure() {
        panel.style.setProperty('--dialog-header-size', `${header?.offsetHeight ?? 0}px`);
        panel.style.setProperty('--dialog-footer-size', `${footer?.offsetHeight ?? 0}px`);
      }
      const sizes = new ResizeObserver(measure);
      // A header or footer can mount after the dialog opens: find them again
      // whenever the panel's content changes.
      function findPinnedEdges() {
        const nextHeader = panel.querySelector<HTMLElement>('[data-pharos-slot="dialog-header"]');
        const nextFooter = panel.querySelector<HTMLElement>('[data-pharos-slot="dialog-footer"]');
        if (nextHeader === header && nextFooter === footer) return;
        header = nextHeader;
        footer = nextFooter;
        sizes.disconnect();
        if (header !== null) sizes.observe(header);
        if (footer !== null) sizes.observe(footer);
        measure();
      }
      const content = new MutationObserver(findPinnedEdges);
      content.observe(panel, { childList: true, subtree: true });
      findPinnedEdges();
      measure();
      return function stopPadding() {
        content.disconnect();
        sizes.disconnect();
        panel.style.removeProperty('--dialog-header-size');
        panel.style.removeProperty('--dialog-footer-size');
      };
    },
    [popup, mode],
  );
}

/**
 * The open and close motion animates `transform`, which the two forms also
 * use to place the panel. Crossing the breakpoint with the dialog open
 * changes the form without that motion: the panel goes straight to its new
 * place instead of sliding half off the screen on every rotation.
 */
function useModeChangeWithoutMotion(popup: HTMLElement | null, mode: DialogMode): void {
  const previousMode = useRef(mode);
  useBrowserLayoutEffect(
    function changeFormInPlace() {
      if (previousMode.current === mode) return;
      previousMode.current = mode;
      if (popup === null) return;
      const transition = popup.style.transition;
      popup.style.transition = 'none';
      // Apply the new form's styles while transitions are off.
      void popup.offsetWidth;
      popup.style.transition = transition;
    },
    [popup, mode],
  );
}

/** Points the panel at Pharos and at the consumer's own `ref`, keeping its cleanup. */
function usePopupRef(
  ref: Ref<HTMLDivElement> | undefined,
): [HTMLDivElement | null, (node: HTMLDivElement | null) => () => void] {
  const [popup, setPopup] = useState<HTMLDivElement | null>(null);
  const setPopupRef = useCallback(
    function setPopupRef(node: HTMLDivElement | null) {
      setPopup(node);
      let cleanupConsumerRef: () => void = function noConsumerRef() {};
      if (typeof ref === 'function') {
        const cleanup = ref(node);
        cleanupConsumerRef =
          typeof cleanup === 'function'
            ? cleanup
            : function clearCallbackRef() {
                ref(null);
              };
      } else if (ref) {
        ref.current = node;
        cleanupConsumerRef = function clearObjectRef() {
          ref.current = null;
        };
      }
      return function detachPopup() {
        setPopup(null);
        cleanupConsumerRef();
      };
    },
    [ref],
  );
  return [popup, setPopupRef];
}

export function DialogContent({ className, children, ref, ...rest }: DialogContentProps) {
  const mode = useDialogMode();
  const [popup, setPopupRef] = usePopupRef(ref);
  useModeChangeWithoutMotion(popup, mode);
  usePinnedEdgesScrollPadding(popup, mode);
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={styles.backdrop} />
      <BaseDialog.Popup
        data-pharos-slot="dialog-content"
        data-pharos-mode={mode}
        className={cn(styles.content, className)}
        {...rest}
        ref={setPopupRef}
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
