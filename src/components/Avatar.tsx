import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import { useRender } from '@base-ui/react/use-render';
import { cn } from '../lib/cn';
import styles from './Avatar.module.css';

/**
 * Compound atom (Decision D14). The state-of-the-art convention across
 * shadcn / Radix / Base UI / Chakra is to expose `Avatar`,
 * `AvatarImage`, and `AvatarFallback` as discrete parts so the consumer
 * composes the fallback content (initials, icon, default image)
 * directly — same Escuela 1 composition principle Pharos applies for
 * Input / Textarea (D11).
 *
 * Two contexts coordinate the parts:
 *
 * - `AvatarShapeContext` carries the resolved `size` / `shape` for
 *   nested `> svg` sizing and AvatarGroup cascade.
 * - `AvatarLoadingContext` carries the image load status so
 *   `AvatarFallback` only renders when the image is missing or has
 *   failed — the same render-gate pattern Radix Primitives document.
 *
 * The group reads `AvatarGroupContext` to cascade `size` / `shape` to
 * every Avatar child and to inject the overflow "+N" badge when the
 * children exceed `max`.
 */

type AvatarSize = 'sm' | 'md' | 'lg' | number;
type AvatarShape = 'circle' | 'square';

interface AvatarShapeContextValue {
  size: AvatarSize;
  shape: AvatarShape;
}

const AvatarShapeContext = createContext<AvatarShapeContextValue | null>(null);

type AvatarLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface AvatarLoadingContextValue {
  status: AvatarLoadingStatus;
  setStatus: (next: AvatarLoadingStatus) => void;
}

const AvatarLoadingContext = createContext<AvatarLoadingContextValue | null>(null);

interface AvatarGroupContextValue {
  size: AvatarSize;
  shape: AvatarShape;
}

const AvatarGroupContext = createContext<AvatarGroupContextValue | null>(null);

const SIZE_CLASSNAME: Record<Exclude<AvatarSize, number>, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

const SHAPE_CLASSNAME: Record<AvatarShape, string> = {
  circle: styles.shapeCircle,
  square: styles.shapeSquare,
};

function resolveSizeStyle(size: AvatarSize): CSSProperties | undefined {
  if (typeof size !== 'number') return undefined;
  // Numeric escape: consumer-supplied one-off dimension. Font-size
  // follows the 0.4 ratio the named sizes (12/14/16 at 32/40/48) imply
  // so an initials fallback still reads correctly inside a non-grid
  // avatar.
  return {
    width: size,
    height: size,
    fontSize: `${Math.round(size * 0.4)}px`,
  };
}

function resolveSizeClassName(size: AvatarSize): string | undefined {
  if (typeof size === 'number') return undefined;
  return SIZE_CLASSNAME[size];
}

// ---------------------------------------------------------------------------
// Avatar (Root)
// ---------------------------------------------------------------------------

export interface AvatarProps extends Omit<useRender.ComponentProps<'span'>, 'children'> {
  /**
   * Avatar dimensions. Named sizes (`sm` / `md` / `lg` = 32 / 40 / 48 px)
   * align with the IconButton / Button height grid. A numeric value
   * sets one-off `width` / `height` / `font-size` inline — use it for
   * profile-picture sized images (e.g. 108 px) or compact stacks
   * (20 px) outside the canonical grid.
   *
   * @default 'md'
   */
  size?: AvatarSize;
  /**
   * Border-radius family. `circle` (default) clips the avatar to a
   * perfect circle via `border-radius: full`; `square` uses the
   * `radius-md` token so an org or product avatar harmonises with the
   * Card corner family on the same surface.
   *
   * @default 'circle'
   */
  shape?: AvatarShape;
  /**
   * The Image and Fallback parts, plus any content the consumer wishes
   * to layer (status badge, ring overlay, etc.). The atom does not
   * inject a default `<AvatarFallback>` — composition is explicit so
   * the consumer is in control of the fallback content (initials,
   * icon, default PNG).
   */
  children?: ReactNode;
}

export function Avatar({
  size,
  shape,
  className,
  style,
  render,
  ref,
  children,
  ...rest
}: AvatarProps) {
  const group = useContext(AvatarGroupContext);
  const resolvedSize: AvatarSize = size ?? group?.size ?? 'md';
  const resolvedShape: AvatarShape = shape ?? group?.shape ?? 'circle';

  const [status, setStatus] = useState<AvatarLoadingStatus>('idle');

  const shapeCtx = useMemo<AvatarShapeContextValue>(
    () => ({ size: resolvedSize, shape: resolvedShape }),
    [resolvedSize, resolvedShape],
  );
  const loadingCtx = useMemo<AvatarLoadingContextValue>(() => ({ status, setStatus }), [status]);

  // Numeric vs named: the named path applies a size class that owns
  // width / height / font-size / --pharos-avatar-overlap; the numeric
  // path skips the class and writes width / height / font-size inline.
  // The shape class always applies — same border-radius regardless of
  // sizing path.
  const sizeClassName = resolveSizeClassName(resolvedSize);
  const sizeStyle = resolveSizeStyle(resolvedSize);

  const resolvedSizeAttr = typeof resolvedSize === 'number' ? String(resolvedSize) : resolvedSize;

  return (
    <AvatarShapeContext.Provider value={shapeCtx}>
      <AvatarLoadingContext.Provider value={loadingCtx}>
        {useRender({
          render: render ?? <span />,
          ref,
          defaultTagName: 'span',
          props: {
            'data-pharos-size': resolvedSizeAttr,
            'data-pharos-shape': resolvedShape,
            'data-pharos-loading': status,
            className: cn(styles.root, sizeClassName, SHAPE_CLASSNAME[resolvedShape], className),
            style: sizeStyle ? { ...sizeStyle, ...style } : style,
            ...rest,
            children,
          },
        })}
      </AvatarLoadingContext.Provider>
    </AvatarShapeContext.Provider>
  );
}

Avatar.displayName = 'Avatar';

// ---------------------------------------------------------------------------
// AvatarImage
// ---------------------------------------------------------------------------

export interface AvatarImageProps extends ComponentPropsWithoutRef<'img'> {
  /**
   * Optional callback invoked when the image transitions between load
   * states. Mirrors Radix / Base UI's `onLoadingStatusChange` so an
   * external consumer can react to the cascade (e.g. emit telemetry
   * when a CDN avatar fails).
   */
  onLoadingStatusChange?: (status: AvatarLoadingStatus) => void;
  ref?: Ref<HTMLImageElement>;
}

export function AvatarImage({
  className,
  src,
  onLoad,
  onError,
  onLoadingStatusChange,
  ref,
  ...rest
}: AvatarImageProps) {
  const loading = useContext(AvatarLoadingContext);

  // When no `src` lands, the image stays hidden and the Fallback
  // renders. Same contract Radix and Base UI document. Without this
  // guard the browser would request the current URL relatively
  // (interpreting `undefined` as empty string), polluting the network
  // tab with a useless 404.
  const hasSrc = typeof src === 'string' && src.length > 0;

  useEffect(() => {
    if (!loading) return;
    // Whenever `src` changes we re-enter the loading phase. The browser
    // re-fires `onLoad` / `onError` for the new URL; the local state
    // resets here so the Fallback returns until the new load resolves.
    loading.setStatus(hasSrc ? 'loading' : 'idle');
    onLoadingStatusChange?.(hasSrc ? 'loading' : 'idle');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const handleLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      loading?.setStatus('loaded');
      onLoadingStatusChange?.('loaded');
      onLoad?.(event);
    },
    [loading, onLoad, onLoadingStatusChange],
  );

  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      loading?.setStatus('error');
      onLoadingStatusChange?.('error');
      onError?.(event);
    },
    [loading, onError, onLoadingStatusChange],
  );

  if (!hasSrc) return null;
  if (loading && loading.status === 'error') return null;

  return (
    <img
      ref={ref}
      src={src}
      onLoad={handleLoad}
      onError={handleError}
      data-pharos-loading={loading?.status}
      className={cn(styles.image, className)}
      {...rest}
    />
  );
}

AvatarImage.displayName = 'AvatarImage';

// ---------------------------------------------------------------------------
// AvatarFallback
// ---------------------------------------------------------------------------

export interface AvatarFallbackProps extends ComponentPropsWithoutRef<'span'> {
  /**
   * Milliseconds to wait before rendering the fallback. Useful when
   * the image is likely to load quickly — delaying the fallback avoids
   * a flash of placeholder before the real avatar paints. Same
   * `delayMs` contract Radix / Base UI document. Defaults to `0`
   * (render immediately while the image is still loading or after an
   * error).
   */
  delayMs?: number;
  ref?: Ref<HTMLSpanElement>;
}

export function AvatarFallback({
  className,
  delayMs = 0,
  children,
  ref,
  ...rest
}: AvatarFallbackProps) {
  const loading = useContext(AvatarLoadingContext);
  const [canRender, setCanRender] = useState(delayMs === 0);

  useEffect(() => {
    if (delayMs === 0) {
      setCanRender(true);
      return;
    }
    const handle = window.setTimeout(() => setCanRender(true), delayMs);
    return () => window.clearTimeout(handle);
  }, [delayMs]);

  // The fallback hides as soon as the image reports `loaded`. Until
  // then (idle / loading / error) the slot is on screen. A consumer
  // that prefers to keep the fallback while the image is mid-flight
  // gets the default; a consumer that only wants the fallback after a
  // hard failure can branch on `data-pharos-loading="error"` from the
  // root.
  if (loading && loading.status === 'loaded') return null;
  if (!canRender) return null;

  return (
    <span
      ref={ref}
      data-pharos-slot="avatar-fallback"
      data-pharos-loading={loading?.status}
      className={cn(styles.fallback, className)}
      {...rest}
    >
      {children}
    </span>
  );
}

AvatarFallback.displayName = 'AvatarFallback';

// ---------------------------------------------------------------------------
// AvatarGroup
// ---------------------------------------------------------------------------

export interface AvatarGroupProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Default `size` cascaded to every Avatar child that does not set
   * its own. Mirrors MUI / Chakra / Mantine Avatar.Group sizing.
   *
   * @default 'md'
   */
  size?: AvatarSize;
  /**
   * Default `shape` cascaded to every Avatar child that does not set
   * its own.
   *
   * @default 'circle'
   */
  shape?: AvatarShape;
  /**
   * Maximum number of Avatar children to render before an overflow
   * indicator takes over the remaining slots. When the children count
   * exceeds `max`, the group renders `max - 1` avatars followed by a
   * compact "+N" Avatar that summarises the surplus.
   *
   * Omitting the prop displays every Avatar without an overflow
   * indicator — the contract MUI / Chakra apply.
   */
  max?: number;
  /**
   * Optional renderer for the overflow indicator. Receives the surplus
   * count and returns the React node placed at the end of the stack
   * (wrapped in an Avatar with matching `size` / `shape`). Defaults to
   * a `+N` text fallback.
   */
  renderOverflow?: (surplus: number) => ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export function AvatarGroup({
  size,
  shape,
  max,
  renderOverflow,
  className,
  children,
  ref,
  ...rest
}: AvatarGroupProps) {
  const resolvedSize: AvatarSize = size ?? 'md';
  const resolvedShape: AvatarShape = shape ?? 'circle';

  const childArray = useMemo(() => {
    const list: ReactNode[] = [];
    // `React.Children.toArray` would assign sequential keys, but using
    // a `Children.forEach` keeps the consumer-provided keys intact
    // when present. The order Avatar children appear in the DOM is the
    // order the consumer passed them — first child paints on top.
    let index = 0;
    const items: ReactNode[] = [];
    const append = (child: ReactNode) => {
      items.push(child);
      index += 1;
    };
    if (Array.isArray(children)) {
      children.forEach((child) => append(child));
    } else if (children) {
      append(children);
    }
    return items.concat(list).slice(0, index);
  }, [children]);

  const visible =
    typeof max === 'number' && childArray.length > max
      ? childArray.slice(0, Math.max(max - 1, 0))
      : childArray;
  const surplus =
    typeof max === 'number' && childArray.length > max ? childArray.length - visible.length : 0;

  const groupCtx = useMemo<AvatarGroupContextValue>(
    () => ({ size: resolvedSize, shape: resolvedShape }),
    [resolvedSize, resolvedShape],
  );

  return (
    <AvatarGroupContext.Provider value={groupCtx}>
      <div
        ref={ref}
        data-pharos-slot="avatar-group"
        data-pharos-size={typeof resolvedSize === 'number' ? String(resolvedSize) : resolvedSize}
        data-pharos-shape={resolvedShape}
        className={cn(styles.group, className)}
        {...rest}
      >
        {visible}
        {surplus > 0 ? (
          <Avatar aria-label={`${surplus} more`} data-pharos-slot="avatar-group-overflow">
            <AvatarFallback>
              {renderOverflow ? renderOverflow(surplus) : `+${surplus}`}
            </AvatarFallback>
          </Avatar>
        ) : null}
      </div>
    </AvatarGroupContext.Provider>
  );
}

AvatarGroup.displayName = 'AvatarGroup';
