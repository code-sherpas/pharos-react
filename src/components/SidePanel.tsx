'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { useRender } from '@base-ui/react/use-render';
import { mergeProps } from '@base-ui/react/merge-props';
import { tokens } from '@code-sherpas/pharos-tokens';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import { Sheet, SheetContent } from './Sheet';
import sheetStyles from './Sheet.module.css';
import styles from './SidePanel.module.css';

/**
 * A contextual side panel. From the panel breakpoint
 * (`breakpoint.panel` in pharos-tokens) up it sits **inline**: an `<aside>`
 * in the consumer's row that narrows its siblings, with no backdrop, no
 * focus trap and no scroll lock — the content beside it stays usable, and
 * neither a click outside nor tabbing out closes it. Below the breakpoint the
 * same panel opens as the modal `Sheet`. One API and one open state: the
 * consumer does not duplicate the content nor watch the viewport width.
 *
 * Keyboard contract (both modes): opening moves focus into the panel (its
 * first focusable element, or `initialFocus`); Escape with focus inside
 * closes it — a layer opened inside it, such as a Select, closes first;
 * closing returns focus to what opened it — the trigger, or the control of
 * the page that opened a controlled panel. Closed, the content unmounts, like
 * Sheet's: keeping what was typed is the consumer's job.
 *
 * @example
 * <div style={{ display: 'flex' }}>
 *   <main style={{ flex: 1 }}>…the report…</main>
 *   <SidePanel>
 *     <SidePanelTrigger render={<Button>Add action</Button>} />
 *     <SidePanelContent>
 *       <SidePanelHeader>
 *         <SidePanelTitle>New action</SidePanelTitle>
 *       </SidePanelHeader>
 *       …the form…
 *       <SidePanelFooter>
 *         <SidePanelClose render={<Button intent="ghost">Cancel</Button>} />
 *       </SidePanelFooter>
 *     </SidePanelContent>
 *   </SidePanel>
 * </div>
 */
export type SidePanelMode = 'inline' | 'modal';

/**
 * The root's context. Nothing in it may change while the page hydrates: React
 * propagates a context change through the whole subtree, and a Suspense
 * boundary still waiting for its streamed HTML would then be rendered in the
 * browser instead of hydrated. So the mode, which the browser only knows after
 * hydrating, is read by each part that needs it (`useSidePanelMode`) through
 * the stable `subscribeToMode`, and whether there is a title or a description
 * lives in `SidePanelContent`.
 */
interface SidePanelContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  titleId: string;
  descriptionId: string;
  triggerRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  /** Set when the breakpoint swaps the surface while focus is in it. */
  focusOnShowRef: RefObject<boolean>;
  /** Subscribes a part to the breakpoint; records focus before it swaps the surface. */
  subscribeToMode: (notify: () => void) => () => void;
  /** The latest open state, for callbacks that run outside render. */
  openRef: RefObject<boolean>;
  /** Where focus goes back when the panel closes. */
  returnFocusTarget: () => HTMLElement | null;
  /** The modal Sheet asks to open or close; only closing reaches the state. */
  closeFromModal: (open: boolean) => void;
}

const SidePanelContext = createContext<SidePanelContextValue | null>(null);

/** What the title and description register with: the surface they label. */
interface SidePanelSurfaceContextValue {
  titleId: string;
  descriptionId: string;
  setHasTitle: (present: boolean) => void;
  setHasDescription: (present: boolean) => void;
}

const SidePanelSurfaceContext = createContext<SidePanelSurfaceContextValue | null>(null);

function useSidePanelSurfaceContext(part: string): SidePanelSurfaceContextValue {
  const context = useContext(SidePanelSurfaceContext);
  if (context === null) {
    throw new Error(`<${part}> must be rendered inside <SidePanelContent>.`);
  }
  return context;
}

function useSidePanelContext(part: string): SidePanelContextValue {
  const context = useContext(SidePanelContext);
  if (context === null) {
    throw new Error(`<${part}> must be rendered inside <SidePanel>.`);
  }
  return context;
}

// `useLayoutEffect` warns during server rendering on React 18; the effect
// only matters in the browser.
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** The media query that puts the panel inline, from the pharos-tokens breakpoint. */
const INLINE_QUERY = `(min-width: ${tokens.breakpoint.panel})`;

function canMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

function readInlineMatch(): boolean {
  return canMatchMedia() ? window.matchMedia(INLINE_QUERY).matches : true;
}

/**
 * The server has no viewport: it renders the inline form, and the browser
 * corrects it right after hydration (useSyncExternalStore re-renders with the
 * client snapshot without a hydration mismatch). Only the parts that read the
 * mode re-render then, never the content the root wraps.
 */
function readServerInlineMatch(): boolean {
  return true;
}

function subscribeToBreakpoint(notify: () => void): () => void {
  if (!canMatchMedia()) return function noop() {};
  const query = window.matchMedia(INLINE_QUERY);
  query.addEventListener('change', notify);
  return function unsubscribe() {
    query.removeEventListener('change', notify);
  };
}

/** The form the panel takes at the current viewport width. */
function useSidePanelMode(subscribeToMode: (notify: () => void) => () => void): SidePanelMode {
  const inline = useSyncExternalStore(subscribeToMode, readInlineMatch, readServerInlineMatch);
  return inline ? 'inline' : 'modal';
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

function firstFocusableIn(container: HTMLElement): HTMLElement | null {
  for (const candidate of container.querySelectorAll<HTMLElement>(FOCUSABLE)) {
    if (!candidate.closest('[inert]') && candidate.getClientRects().length > 0) return candidate;
  }
  // jsdom has no layout: fall back to the first match in DOM order.
  return container.querySelector<HTMLElement>(FOCUSABLE);
}

function isFocusInside(container: HTMLElement | null): boolean {
  return container !== null && container.contains(document.activeElement);
}

export interface SidePanelProps {
  /** Whether the panel is open (controlled). */
  open?: boolean;
  /** Whether the panel starts open (uncontrolled). */
  defaultOpen?: boolean;
  /** Called when the panel asks to open or close. */
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/**
 * Holds the open state and decides the mode. Renders no element of its own:
 * `SidePanelContent` lands where it is placed in the consumer's layout.
 */
export function SidePanel({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
}: SidePanelProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;

  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLElement | null>(null);
  const focusOnShowRef = useRef(false);
  const openRef = useRef(open);
  useBrowserLayoutEffect(
    function trackOpen() {
      openRef.current = open;
    },
    [open],
  );

  // The breakpoint is about to swap the surface: if focus is in the one
  // leaving, the one arriving takes it. The browser lets React re-render
  // between two listeners of the same change, so focus is recorded by the
  // first listener to run, before any part is told, and only once per change.
  const inlineSeenRef = useRef<boolean | null>(null);
  const subscribeToMode = useCallback(function subscribeToMode(notify: () => void) {
    return subscribeToBreakpoint(function recordFocusThenNotify() {
      const inline = readInlineMatch();
      if (inline !== inlineSeenRef.current) {
        inlineSeenRef.current = inline;
        focusOnShowRef.current = isFocusInside(contentRef.current);
      }
      notify();
    });
  }, []);
  const mode = useSidePanelMode(subscribeToMode);

  const setOpen = useCallback(
    function setOpen(next: boolean) {
      if (next === open) return;
      if (openProp === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [open, openProp, onOpenChange],
  );

  // The element that had focus before the panel opened: the trigger, or the
  // control of a page that opens a controlled panel. Recorded while the panel
  // is closed; focus moving into the panel (or a modal focus guard) is not it.
  const openerRef = useRef<HTMLElement | null>(null);
  useEffect(function recordOpener() {
    function handleFocusIn(event: FocusEvent) {
      const target = event.target;
      if (openRef.current || !(target instanceof HTMLElement)) return;
      if (contentRef.current?.contains(target) || target.hasAttribute('data-base-ui-focus-guard'))
        return;
      openerRef.current = target;
    }
    document.addEventListener('focusin', handleFocusIn);
    return function stopRecordingOpener() {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, []);

  const returnFocusTarget = useCallback(function returnFocusTarget(): HTMLElement | null {
    const opener = openerRef.current;
    if (opener !== null && opener.isConnected && !contentRef.current?.contains(opener)) {
      return opener;
    }
    return triggerRef.current;
  }, []);

  const wasOpenRef = useRef(open);
  useBrowserLayoutEffect(
    function returnFocusOnClose() {
      const closed = wasOpenRef.current && !open;
      wasOpenRef.current = open;
      // Inline only: the modal surface returns focus itself (`finalFocus`).
      // However it closed — the trigger, Escape, SidePanelClose or the
      // owner of a controlled panel — the closing panel is still mounted
      // here, so focus inside it goes back to what opened it.
      if (closed && mode === 'inline' && isFocusInside(contentRef.current)) {
        returnFocusTarget()?.focus();
      }
    },
    [open, mode, returnFocusTarget],
  );

  const closeFromModal = useCallback(
    function closeFromModal(next: boolean) {
      if (!next) setOpen(false);
    },
    [setOpen],
  );

  const baseId = useId();

  const context = useMemo<SidePanelContextValue>(
    () => ({
      open,
      setOpen,
      contentId: `${baseId}-content`,
      titleId: `${baseId}-title`,
      descriptionId: `${baseId}-description`,
      triggerRef,
      contentRef,
      focusOnShowRef,
      subscribeToMode,
      openRef,
      returnFocusTarget,
      closeFromModal,
    }),
    [open, setOpen, baseId, subscribeToMode, returnFocusTarget, closeFromModal],
  );

  // No dialog root here: the content beside the panel is not inside any
  // dialog, so a Sheet, Dialog or AlertDialog opened from it is a modal of its
  // own, with its backdrop. Only the modal form of SidePanelContent is one.
  return <SidePanelContext.Provider value={context}>{children}</SidePanelContext.Provider>;
}

SidePanel.displayName = 'SidePanel';

/**
 * The control that opens and closes the panel. Renders a native `<button>`
 * by default; pass `render` to compose any control
 * (`render={<Button…/>}`). Exposes `aria-expanded` and, while the panel is
 * open, `aria-controls` pointing at it.
 */
export type SidePanelTriggerProps = useRender.ComponentProps<'button'>;

export function SidePanelTrigger({ render, ref, ...rest }: SidePanelTriggerProps) {
  const { open, setOpen, contentId, triggerRef, subscribeToMode } =
    useSidePanelContext('SidePanelTrigger');
  const mode = useSidePanelMode(subscribeToMode);
  function toggle() {
    setOpen(!open);
  }
  return useRender({
    render: render ?? <button />,
    ref:
      ref === undefined
        ? (triggerRef as RefObject<HTMLButtonElement | null>)
        : [ref, triggerRef as RefObject<HTMLButtonElement | null>],
    defaultTagName: 'button',
    props: mergeProps<'button'>(
      {
        type: 'button',
        'aria-expanded': open,
        'aria-controls': open ? contentId : undefined,
        'aria-haspopup': mode === 'modal' ? 'dialog' : undefined,
        onClick: toggle,
      },
      { 'data-pharos-slot': 'side-panel-trigger' } as ComponentPropsWithoutRef<'button'>,
      rest,
    ),
  });
}

SidePanelTrigger.displayName = 'SidePanelTrigger';

const inlineVariants = cva(styles.inline, {
  variants: {
    side: {
      right: styles.sideRight,
      left: styles.sideLeft,
    },
  },
  defaultVariants: {
    side: 'right',
  },
});

type SidePanelContentVariantProps = VariantProps<typeof inlineVariants>;

export interface SidePanelContentProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'role'>, SidePanelContentVariantProps {
  /**
   * The element that takes focus when the panel opens. Defaults to the first
   * focusable element inside it (the panel itself if there is none).
   */
  initialFocus?: RefObject<HTMLElement | null>;
}

type InlineStatus = 'closed' | 'starting' | 'open' | 'ending';

function waitForTransitions(element: HTMLElement | null): Promise<unknown> {
  if (element === null || typeof element.getAnimations !== 'function') return Promise.resolve();
  return Promise.allSettled(
    element.getAnimations().map(function finished(animation) {
      return animation.finished;
    }),
  );
}

/**
 * Keeps the inline panel mounted while its closing transition runs, and
 * marks its first frame so it can grow in. Opening on the first render (a
 * panel `defaultOpen`) does not animate.
 */
function useInlinePresence(open: boolean, contentRef: RefObject<HTMLElement | null>): InlineStatus {
  const [status, setStatus] = useState<InlineStatus>(open ? 'open' : 'closed');
  if (open && (status === 'closed' || status === 'ending')) setStatus('starting');
  if (!open && (status === 'open' || status === 'starting')) setStatus('ending');

  useEffect(
    function advanceInlineStatus() {
      if (status === 'starting') {
        // Let the browser paint the collapsed state, then grow.
        const frame = requestAnimationFrame(function grow() {
          setStatus('open');
        });
        return function cancelGrow() {
          cancelAnimationFrame(frame);
        };
      }
      if (status === 'ending') {
        let cancelled = false;
        const frame = requestAnimationFrame(function collapseThenUnmount() {
          void waitForTransitions(contentRef.current).then(function unmount() {
            if (!cancelled) setStatus('closed');
          });
        });
        return function cancelCollapse() {
          cancelled = true;
          cancelAnimationFrame(frame);
        };
      }
      return undefined;
    },
    [status, contentRef],
  );

  return status;
}

/**
 * The panel surface. Inline, an `<aside>` (a complementary landmark named by
 * `SidePanelTitle`) placed as a sibling of the content in the consumer's
 * flex or grid row; below the breakpoint, Pharos' modal Sheet docked to the
 * same `side`. Mirrors `data-pharos-side` and `data-pharos-mode`.
 */
export function SidePanelContent({
  side = 'right',
  initialFocus,
  className,
  children,
  onKeyDown,
  ...rest
}: SidePanelContentProps) {
  const context = useSidePanelContext('SidePanelContent');
  const resolvedSide = side ?? 'right';
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);
  const labelling = {
    'aria-labelledby': hasTitle ? context.titleId : undefined,
    'aria-describedby': hasDescription ? context.descriptionId : undefined,
  };
  const surface = useMemo<SidePanelSurfaceContextValue>(
    () => ({
      titleId: context.titleId,
      descriptionId: context.descriptionId,
      setHasTitle,
      setHasDescription,
    }),
    [context.titleId, context.descriptionId],
  );

  const modal = useSidePanelMode(context.subscribeToMode) === 'modal';

  // The modal surface is Pharos' Sheet. Its root wraps only that surface, so
  // nothing beside the panel, nor the inline panel, is inside a dialog. It
  // stays mounted in both forms, closed while inline, so crossing the
  // breakpoint into the modal form opens it — and it slides in — instead of
  // mounting it already open.
  return (
    <SidePanelSurfaceContext.Provider value={surface}>
      <Sheet open={context.open && modal} onOpenChange={context.closeFromModal}>
        {modal ? (
          <SheetContent
            side={resolvedSide}
            id={context.contentId}
            ref={context.contentRef as RefObject<HTMLDivElement | null>}
            initialFocus={initialFocus}
            finalFocus={function returnFocusOnClose() {
              // Still open means the breakpoint swapped the surface: the inline
              // panel takes focus instead of the trigger.
              return context.openRef.current ? false : context.returnFocusTarget();
            }}
            {...labelling}
            {...rest}
            onKeyDown={onKeyDown}
            data-pharos-slot="side-panel-content"
            data-pharos-mode="modal"
            className={className}
          >
            {children}
          </SheetContent>
        ) : null}
      </Sheet>
      {modal ? null : (
        <InlineSurface
          side={resolvedSide}
          initialFocus={initialFocus}
          className={className}
          onKeyDown={onKeyDown}
          labelling={labelling}
          rest={rest}
        >
          {children}
        </InlineSurface>
      )}
    </SidePanelSurfaceContext.Provider>
  );
}

SidePanelContent.displayName = 'SidePanelContent';

interface InlineSurfaceProps {
  side: 'left' | 'right';
  initialFocus: RefObject<HTMLElement | null> | undefined;
  className: string | undefined;
  onKeyDown: ((event: KeyboardEvent<HTMLDivElement>) => void) | undefined;
  labelling: { 'aria-labelledby': string | undefined; 'aria-describedby': string | undefined };
  rest: Omit<ComponentPropsWithoutRef<'div'>, 'role' | 'className' | 'children' | 'onKeyDown'>;
  children: ReactNode;
}

function InlineSurface({
  side,
  initialFocus,
  className,
  onKeyDown,
  labelling,
  rest,
  children,
}: InlineSurfaceProps) {
  const { open, setOpen, contentId, contentRef, focusOnShowRef } =
    useSidePanelContext('SidePanelContent');
  const status = useInlinePresence(open, contentRef);

  useBrowserLayoutEffect(
    function focusOnShow() {
      // `starting`: opened after the first render, however it was opened. A
      // panel open from the first render (`defaultOpen`) does not take focus,
      // unless it arrives from the other form with focus in it.
      if (status !== 'starting' && !(status === 'open' && focusOnShowRef.current)) return;
      focusOnShowRef.current = false;
      const panel = contentRef.current;
      if (panel === null) return;
      const target = initialFocus?.current ?? firstFocusableIn(panel) ?? panel;
      target.focus();
    },
    [status, initialFocus, contentRef, focusOnShowRef],
  );

  if (status === 'closed') return null;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    // A layer opened inside the panel (a Select, a Menu) handles its own
    // Escape and marks it: it closes first, the panel on the next press.
    if (event.key !== 'Escape' || event.defaultPrevented || event.nativeEvent.isComposing) return;
    event.preventDefault();
    setOpen(false);
  }

  return (
    <aside
      id={contentId}
      ref={contentRef as RefObject<HTMLElement | null>}
      tabIndex={-1}
      {...labelling}
      {...rest}
      onKeyDown={handleKeyDown}
      // Collapsing: already closed for the trigger (aria-expanded="false"),
      // so it can no longer be reached nor read while it animates out.
      inert={status === 'ending' ? true : undefined}
      data-pharos-slot="side-panel-content"
      data-pharos-side={side}
      data-pharos-mode="inline"
      data-starting-style={status === 'starting' ? '' : undefined}
      data-ending-style={status === 'ending' ? '' : undefined}
      className={cn(inlineVariants({ side }), className)}
    >
      <div className={styles.inlineBody}>{children}</div>
    </aside>
  );
}

/** Groups the title and description at the top of the panel. */
export interface SidePanelHeaderProps extends ComponentPropsWithoutRef<'div'> {}

export function SidePanelHeader({ className, ...rest }: SidePanelHeaderProps) {
  return (
    <div
      data-pharos-slot="side-panel-header"
      className={cn(sheetStyles.header, className)}
      {...rest}
    />
  );
}

SidePanelHeader.displayName = 'SidePanelHeader';

/** The panel's accessible name, in both modes. Renders an `<h2>`. */
export interface SidePanelTitleProps extends ComponentPropsWithoutRef<'h2'> {}

export function SidePanelTitle({ className, ...rest }: SidePanelTitleProps) {
  const { titleId, setHasTitle } = useSidePanelSurfaceContext('SidePanelTitle');
  useBrowserLayoutEffect(
    function registerTitle() {
      setHasTitle(true);
      return function unregisterTitle() {
        setHasTitle(false);
      };
    },
    [setHasTitle],
  );
  return (
    <h2
      id={titleId}
      data-pharos-slot="side-panel-title"
      className={cn(sheetStyles.title, className)}
      {...rest}
    />
  );
}

SidePanelTitle.displayName = 'SidePanelTitle';

/** Supporting copy under the title; describes the panel. Renders a `<p>`. */
export interface SidePanelDescriptionProps extends ComponentPropsWithoutRef<'p'> {}

export function SidePanelDescription({ className, ...rest }: SidePanelDescriptionProps) {
  const { descriptionId, setHasDescription } = useSidePanelSurfaceContext('SidePanelDescription');
  useBrowserLayoutEffect(
    function registerDescription() {
      setHasDescription(true);
      return function unregisterDescription() {
        setHasDescription(false);
      };
    },
    [setHasDescription],
  );
  return (
    <p
      id={descriptionId}
      data-pharos-slot="side-panel-description"
      className={cn(sheetStyles.description, className)}
      {...rest}
    />
  );
}

SidePanelDescription.displayName = 'SidePanelDescription';

/** Bottom action row, pushed to the panel's end. */
export interface SidePanelFooterProps extends ComponentPropsWithoutRef<'div'> {}

export function SidePanelFooter({ className, ...rest }: SidePanelFooterProps) {
  return (
    <div
      data-pharos-slot="side-panel-footer"
      className={cn(sheetStyles.footer, className)}
      {...rest}
    />
  );
}

SidePanelFooter.displayName = 'SidePanelFooter';

/**
 * A button that closes the panel and returns focus to what opened it. Renders a
 * native `<button>`; compose any control via `render`.
 */
export type SidePanelCloseProps = useRender.ComponentProps<'button'>;

export function SidePanelClose({ render, ref, ...rest }: SidePanelCloseProps) {
  const { setOpen } = useSidePanelContext('SidePanelClose');
  function close() {
    setOpen(false);
  }
  return useRender({
    render: render ?? <button />,
    ref,
    defaultTagName: 'button',
    props: mergeProps<'button'>(
      { type: 'button', onClick: close },
      { 'data-pharos-slot': 'side-panel-close' } as ComponentPropsWithoutRef<'button'>,
      rest,
    ),
  });
}

SidePanelClose.displayName = 'SidePanelClose';
