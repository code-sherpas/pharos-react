'use client';

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import styles from './Alert.module.css';

/**
 * Something the person has to read, inside a page, a form or a dialog — a
 * warning before a decision, a note, a part of the page that could not load —
 * that stays in the flow for as long as it is true. Not a `Toast` (which goes
 * away on its own and is for what can be missed) and not a `Dialog` (which
 * interrupts). Names and parts follow shadcn: `Alert`, `AlertTitle`,
 * `AlertDescription`, `AlertAction`.
 *
 * - **`variant`** says what it is about, with the values of `Toast` and
 *   `Badge`. Every variant but `default` adds the same icon as `Toast`, and
 *   each has its own side bar, so the tone never rests on colour alone; the
 *   text stays in the normal text colour.
 * - **It is a live region.** `warning` and `destructive` are `role="alert"`
 *   (announced at once); `default`, `info` and `success` are `role="status"`
 *   (announced when the screen reader is idle).
 * - **It is announced when it appears.** A live region inserted together with
 *   its text is announced unreliably. An `Alert` mounted after the page loaded
 *   renders everything at once — the box takes its final size and every node
 *   exists from the first render, refs and effects included — but its content
 *   is `visibility: hidden` for two frames, out of the accessibility tree, and
 *   then shown: assistive technology sees the text arrive inside a region it
 *   already knows. The one thing that waits is focus: an element inside cannot
 *   take focus (`autoFocus` included) during those two frames. An `Alert` in
 *   the server HTML is shown at once, as part of the page: it is not
 *   announced, and it is found by reading the page.
 * - **Changing it.** New text in an `Alert` on screen is a change inside its
 *   live region, and is announced. Changing `variant` across urgency — from
 *   `info` to `warning`, say — changes its role, so the alert is mounted anew,
 *   as if it had just appeared, and announced with the new urgency; its
 *   children mount anew too.
 * - It does not close on its own and has no close button. What the person can
 *   do about it — "Retry" — goes in `AlertAction`, after `AlertDescription`:
 *   one or more Pharos `Button`s, under the text, in reading and focus order.
 * - **Telling the person a retry failed again.** Keep the same `Alert` on
 *   screen and change its text — "Still couldn't load, after 2 attempts" — so
 *   the change is seen and announced in the region, and the focused `Retry`
 *   stays where it is. Remounting it (a new `key`) would announce it too, but
 *   would take the focus away with the button.
 * - Pharos puts no text in it: the title, the description and the action
 *   come from the consumer, localised. `AlertTitle` is a `div`; give it the
 *   heading level its place needs with `render`.
 *
 * @example
 * <Alert variant="warning">
 *   <AlertTitle render={<h3 />}>Used in 7 assessments</AlertTitle>
 *   <AlertDescription>Saving changes what they mean.</AlertDescription>
 * </Alert>
 *
 * @example
 * <Alert variant="destructive">
 *   <AlertTitle render={<h2 />}>Billing couldn't be loaded</AlertTitle>
 *   <AlertDescription>The rest of the page is up to date.</AlertDescription>
 *   <AlertAction>
 *     <Button intent="secondary" size="sm" onClick={retry}>Retry</Button>
 *   </AlertAction>
 * </Alert>
 */

/** What an alert is about. The same values as `Toast` and `Badge`. */
export type AlertVariant = 'default' | 'info' | 'success' | 'warning' | 'destructive';

const alertVariants = cva(styles.alert, {
  variants: {
    variant: {
      default: styles.default,
      info: styles.info,
      success: styles.success,
      warning: styles.warning,
      destructive: styles.destructive,
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

/** Urgent tones interrupt; the rest wait until the screen reader is idle. */
const ROLE_BY_VARIANT = {
  default: 'status',
  info: 'status',
  success: 'status',
  warning: 'alert',
  destructive: 'alert',
} as const satisfies Record<AlertVariant, 'status' | 'alert'>;

/** `role` is not a prop: it follows from `variant`. */
export interface AlertProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'role'>, VariantProps<typeof alertVariants> {}

export function Alert({ variant, ...rest }: AlertProps) {
  const resolvedVariant = variant ?? 'default';
  const role = ROLE_BY_VARIANT[resolvedVariant];
  // A new role is a new live region: keyed by it, the alert mounts anew and
  // is announced with its new urgency, rather than switching role in silence.
  return <AlertRegion key={role} role={role} variant={resolvedVariant} {...rest} />;
}

Alert.displayName = 'Alert';

interface AlertRegionProps extends Omit<AlertProps, 'variant'> {
  role: 'status' | 'alert';
  variant: AlertVariant;
}

function AlertRegion({ role, variant, className, children, ...rest }: AlertRegionProps) {
  const showContent = useContentShownAfterTheRegion();
  return (
    <div
      role={role}
      data-pharos-variant={variant}
      className={cn(alertVariants({ variant }), className)}
      {...rest}
    >
      <VariantIcon variant={variant} />
      <div
        data-pharos-slot="alert-content"
        className={styles.content}
        // Inline, not a class: hidden must hold whatever stylesheet is loaded.
        style={showContent ? undefined : { visibility: 'hidden' }}
      >
        {children}
      </div>
    </div>
  );
}

export interface AlertTitleProps extends useRender.ComponentProps<'div'> {}

/**
 * The alert's title: what it is about, in a few words. A `div` by default;
 * `render={<h3 />}` (or any level) makes it a heading of the level its place
 * in the page needs.
 */
export function AlertTitle({ render, className, ref, ...rest }: AlertTitleProps) {
  return useRender({
    render: render ?? <div />,
    ref,
    defaultTagName: 'div',
    props: {
      'data-pharos-slot': 'alert-title',
      className: cn(styles.title, className),
      ...rest,
    },
  });
}

AlertTitle.displayName = 'AlertTitle';

export interface AlertDescriptionProps extends ComponentPropsWithoutRef<'div'> {}

/** The detail under the title: what it means and what the person can do. */
export function AlertDescription({ className, ...rest }: AlertDescriptionProps) {
  return (
    <div
      data-pharos-slot="alert-description"
      className={cn(styles.description, className)}
      {...rest}
    />
  );
}

AlertDescription.displayName = 'AlertDescription';

export interface AlertActionProps extends ComponentPropsWithoutRef<'div'> {}

/**
 * What the person can do about the alert — "Retry", "Review" — after the
 * description: one or more Pharos `Button`s, in a row that wraps. It sits
 * under the text, where it comes in the reading and focus order, not in a
 * corner. The consumer writes the labels, localised.
 */
export function AlertAction({ className, ...rest }: AlertActionProps) {
  return <div data-pharos-slot="alert-action" className={cn(styles.action, className)} {...rest} />;
}

AlertAction.displayName = 'AlertAction';

export { alertVariants };

function subscribeToNothing() {
  return function unsubscribe() {};
}

function renderingOnTheClient() {
  return true;
}

function renderingOnTheServer() {
  return false;
}

/**
 * Whether the alert's content is shown yet. During server rendering and
 * hydration it is at once: the alert is part of the page as loaded. Mounted on
 * the client after that, the content is hidden for two frames — the delay
 * Radix uses for its toast announcements — so assistive technology sees text
 * added to a live region it already knows.
 */
function useContentShownAfterTheRegion(): boolean {
  const mountedOnTheClient = useSyncExternalStore(
    subscribeToNothing,
    renderingOnTheClient,
    renderingOnTheServer,
  );
  const [showContent, setShowContent] = useState(!mountedOnTheClient);
  useEffect(
    function insertTheContentOnceTheRegionExists() {
      if (showContent) return;
      let secondFrame = 0;
      const firstFrame = requestAnimationFrame(function waitForTheNextFrame() {
        secondFrame = requestAnimationFrame(function showTheContent() {
          setShowContent(true);
        });
      });
      return function cancelPendingFrames() {
        cancelAnimationFrame(firstFrame);
        cancelAnimationFrame(secondFrame);
      };
    },
    [showContent],
  );
  return showContent;
}

/**
 * The variant's icon: the same Lucide glyphs as `Toast`, inlined so the bundle
 * pulls no icon dependency (D4). Decorative to assistive technology: the title
 * says what the alert is about.
 */
function VariantIcon({ variant }: { variant: AlertVariant }) {
  switch (variant) {
    case 'success':
      return (
        <Glyph name="circle-check">
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </Glyph>
      );
    case 'info':
      return (
        <Glyph name="info">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </Glyph>
      );
    case 'warning':
      return (
        <Glyph name="triangle-alert">
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
        <Glyph name="circle-alert">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </Glyph>
      );
    default:
      return null;
  }
}

/**
 * `data-pharos-icon` names the Lucide glyph, a stable hook for tests and
 * selectors that tells the variants' icons apart without reading their paths.
 */
function Glyph({ name, children }: { name: string; children: ReactNode }) {
  return (
    <svg
      data-pharos-slot="alert-icon"
      data-pharos-icon={name}
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
