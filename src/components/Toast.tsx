'use client';

import { useMemo, type ComponentProps, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { Toast as BaseToast } from '@base-ui/react/toast';
import { cn } from '../lib/cn';
import { Button } from './Button';
import { IconButton } from './IconButton';
import styles from './Toast.module.css';

/**
 * A brief, non-blocking message about something that just happened — "Settings
 * saved", "Couldn't send the invitation" — shown in a corner of the screen and
 * gone on its own (Decision D30). Wraps Base UI's `Toast`, which provides the
 * accessibility contract:
 *
 * - the toasts live in a **`region` landmark that is a live region from the
 *   start**, so a toast is announced when it appears (politely; urgently with
 *   `priority: 'high'`) without the consumer adding one;
 * - **F6** moves focus into that region and Tab walks its toasts and buttons;
 * - a toast **pauses its timer** while the pointer is over the region or focus
 *   is inside it, so nobody loses a message while reading or reaching it;
 * - it can be swiped away, and the close button is the single-pointer
 *   alternative to the swipe (WCAG 2.5.7).
 *
 * The API follows shadcn's `Toaster` + a hook, over Base UI's provider and
 * manager: `ToastProvider` at the root, one `Toaster` where the toasts render,
 * and `useToast()` wherever one is raised. Pharos owns no text (quality
 * standard § 5): the region's name and the close button's name are required
 * props of `Toaster`, localised by the consumer.
 *
 * A toast is for feedback that can be missed. A message the person must act on,
 * or one that blocks the flow, is a `Dialog`; an error tied to a field is shown
 * next to the field.
 *
 * @example
 * <ToastProvider>
 *   <App />
 *   <Toaster position="top-center" label="Notifications" closeLabel="Close" />
 * </ToastProvider>
 *
 * const toast = useToast();
 * toast.add({ title: 'Settings saved', variant: 'success' });
 */

/** What a toast is about. Mirrors `Badge`'s semantic variants. */
export type ToastVariant = 'default' | 'success' | 'info' | 'warning' | 'destructive';

export interface ToastOptions {
  /**
   * Identifies the toast. Adding one with the id of a toast still on screen
   * replaces it in place and restarts its timer — the way to avoid stacking
   * the same message twice.
   */
  id?: string;
  /** The message. Also what assistive technology announces. */
  title?: ReactNode;
  /** Detail under the title. */
  description?: ReactNode;
  /**
   * What the toast is about. Every variant but `default` adds an icon, so the
   * meaning never rests on colour alone.
   * @default 'default'
   */
  variant?: ToastVariant;
  /**
   * Milliseconds before it closes on its own; `0` keeps it until closed. A
   * toast with an `action` defaults to `0`: a control that disappears on a
   * timer is a control some people never reach (WCAG 2.2.1).
   * @default the provider's `timeout`
   */
  timeout?: number;
  /**
   * `high` announces it at once, interrupting; reserve it for what genuinely
   * cannot wait. Everything else is announced when the screen reader is idle.
   * @default 'low'
   */
  priority?: 'low' | 'high';
  /**
   * One button in the toast — "Undo", "Retry". Its `children` are its label;
   * clicking it runs `onClick` and closes the toast.
   */
  action?: ComponentPropsWithoutRef<'button'>;
  /** Called when the toast starts closing, whatever closed it. */
  onClose?: () => void;
}

export interface UseToastReturnValue {
  /** Shows a toast and returns its id. */
  add: (options: ToastOptions) => string;
  /** Closes one toast by id, or every toast when called without one. */
  close: (id?: string) => void;
  /** Changes a toast that is on screen. */
  update: (id: string, options: Omit<ToastOptions, 'id'>) => void;
}

/** Translates Pharos's options to Base UI's: `variant` travels as its `type`. */
function toBaseOptions({ variant, action, timeout, ...rest }: Omit<ToastOptions, 'id'>) {
  return {
    ...rest,
    type: variant,
    actionProps: action,
    timeout: timeout ?? (action === undefined ? undefined : 0),
  };
}

/**
 * Raises, updates and closes toasts. Must be called inside a `ToastProvider`.
 */
export function useToast(): UseToastReturnValue {
  const { add, close, update } = BaseToast.useToastManager();
  // Base UI's methods are stable, so this is too: safe in an effect's deps.
  return useMemo(
    () => ({
      add: function addToast({ id, ...options }) {
        return add({ id, ...toBaseOptions(options) });
      },
      close,
      update: function updateToast(id, options) {
        update(id, toBaseOptions(options));
      },
    }),
    [add, close, update],
  );
}

export interface ToastProviderProps {
  children?: ReactNode;
  /**
   * Default milliseconds before a toast closes on its own. Seven seconds is
   * enough to read two lines at a relaxed pace; the timer also pauses while
   * the pointer or focus is on the toasts.
   * @default 7000
   */
  timeout?: number;
  /**
   * How many toasts are on screen at once; adding one more closes the oldest.
   * @default 3
   */
  limit?: number;
}

/** Holds the toasts of the whole app. Place it once, near the root. */
export function ToastProvider({ timeout = 7000, limit = 3, children }: ToastProviderProps) {
  return (
    <BaseToast.Provider timeout={timeout} limit={limit}>
      {children}
    </BaseToast.Provider>
  );
}

ToastProvider.displayName = 'ToastProvider';

/** Where on the screen the toasts appear. Logical: `start` is left in LTR. */
export type ToasterPosition =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end';

export interface ToasterProps extends Omit<
  ComponentProps<typeof BaseToast.Viewport>,
  'children' | 'aria-label'
> {
  /**
   * Where the toasts appear. The newest is always the one nearest the edge.
   * @default 'bottom-end'
   */
  position?: ToasterPosition;
  /** Name of the region that holds the toasts, e.g. "Notifications". */
  label: string;
  /** Name of each toast's close button, e.g. "Close". */
  closeLabel: string;
}

/** Renders the toasts. Place it once, inside `ToastProvider`. */
export function Toaster({
  position = 'bottom-end',
  label,
  closeLabel,
  className,
  ...rest
}: ToasterProps) {
  const { toasts, close } = BaseToast.useToastManager();
  const [edge] = position.split('-');
  return (
    <BaseToast.Portal>
      <BaseToast.Viewport
        aria-label={label}
        data-pharos-position={position}
        className={cn(styles.viewport, className)}
        {...rest}
      >
        {toasts.map((toast) => (
          <BaseToast.Root
            key={toast.id}
            toast={toast}
            swipeDirection={edge === 'top' ? ['up', 'right', 'left'] : ['down', 'right', 'left']}
            data-pharos-slot="toast"
            data-pharos-variant={(toast.type as ToastVariant | undefined) ?? 'default'}
            className={styles.toast}
          >
            <BaseToast.Content className={styles.content}>
              <VariantIcon variant={toast.type as ToastVariant | undefined} />
              <div className={styles.text}>
                <BaseToast.Title className={styles.title} />
                <BaseToast.Description className={styles.description} />
                {/* Under the text, so the message keeps the whole width at
                 * any size. Base UI runs the action and leaves the toast;
                 * once acted on, it has said what it had to say. */}
                {toast.actionProps && (
                  <BaseToast.Action
                    className={styles.action}
                    render={<Button intent="secondary" size="sm" />}
                    onClick={function closeOnceActedOn() {
                      close(toast.id);
                    }}
                  />
                )}
              </div>
              <BaseToast.Close
                className={styles.close}
                render={<IconButton intent="ghost" size="sm" aria-label={closeLabel} />}
              >
                <XIcon />
              </BaseToast.Close>
            </BaseToast.Content>
          </BaseToast.Root>
        ))}
      </BaseToast.Viewport>
    </BaseToast.Portal>
  );
}

Toaster.displayName = 'Toaster';

/**
 * The variant's icon, inlined from Lucide's path data so the bundle pulls no
 * icon dependency (D4, as in `Select`). Decorative to assistive technology:
 * the title says what happened.
 */
function VariantIcon({ variant }: { variant: ToastVariant | undefined }) {
  switch (variant) {
    case 'success':
      return (
        <Glyph>
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </Glyph>
      );
    case 'info':
      return (
        <Glyph>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </Glyph>
      );
    case 'warning':
      return (
        <Glyph>
          <path
            className={styles.warningFill}
            d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"
          />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </Glyph>
      );
    case 'destructive':
      return (
        <Glyph>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </Glyph>
      );
    default:
      return null;
  }
}

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
