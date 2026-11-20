import { useSyncExternalStore, type ReactNode, type Ref } from 'react';
import { tokens } from '@code-sherpas/pharos-tokens';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@code-sherpas/pharos-react';

/**
 * Below the compact breakpoint, read from the tokens' JS object (not the CSS
 * variable, which does not work inside a media query): the same cut, and the
 * same query, Dialog uses.
 */
const COMPACT = `not all and (min-width: ${tokens.breakpoint.compact})`;

function subscribeToCompact(onChange: () => void) {
  const query = window.matchMedia(COMPACT);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function isCompactNow() {
  return window.matchMedia(COMPACT).matches;
}

/**
 * Whether the window is narrower than `breakpoint.compact`. Read in the first
 * render, so the actions already come out in the shape of their width: no
 * flash of the other shape. With no window (a server render) it answers «not
 * compact»; a server-rendered app would decide that shape on the server.
 */
export function useIsCompact() {
  return useSyncExternalStore(subscribeToCompact, isCompactNow, function notCompactOnTheServer() {
    return false;
  });
}

/** An action that is not the principal one. */
export interface SecondaryAction {
  /** Stable, for keys and `data-item-action`. */
  id: string;
  label: string;
  onSelect: () => void;
  /** Cannot be undone: the destructive tone, and always last. */
  destructive?: boolean;
}

interface ItemActionsProps {
  /** The principal action, already a `Button` (or a trigger rendering one). */
  primary?: ReactNode;
  secondary: SecondaryAction[];
  /** Text of the button that opens the menu with the rest. */
  moreLabel?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * The «Actions on an item» pattern of Pharos, composed from Button and
 * DropdownMenu with no component of its own:
 *
 * - in a compact width, one or two actions show in a row; with three or more,
 *   only the principal one shows, beside a secondary «More actions» button
 *   that opens a DropdownMenu with the rest;
 * - otherwise every action shows, in a row that wraps when it does not fit;
 * - the destructive ones always go last: after a separator, in the menu's
 *   destructive variant, or last in the row with the destructive intent;
 * - every action is a `md` Button, and the DOM order is the visual order.
 *
 * With no action at all it renders nothing, so the header keeps the same
 * shape, with only its title.
 */
export function ItemActions({
  primary,
  secondary,
  moreLabel = 'More actions',
  ref,
}: ItemActionsProps) {
  const compact = useIsCompact();
  const count = (primary ? 1 : 0) + secondary.length;
  if (count === 0) return null;

  const ordinary = secondary.filter((action) => !action.destructive);
  const destructive = secondary.filter((action) => action.destructive);
  const grouped = compact && count > 2;

  return (
    <div
      ref={ref}
      className="item-actions"
      data-item-actions={grouped ? 'grouped' : 'row'}
      role="group"
      aria-label="Actions"
    >
      {primary}
      {grouped ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button intent="secondary" size="md" data-item-action="more">
                {moreLabel}
              </Button>
            }
          />
          <DropdownMenuContent>
            {ordinary.map((action) => (
              <DropdownMenuItem
                key={action.id}
                data-item-action={action.id}
                onClick={action.onSelect}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
            {ordinary.length > 0 && destructive.length > 0 && <DropdownMenuSeparator />}
            {destructive.map((action) => (
              <DropdownMenuItem
                key={action.id}
                variant="destructive"
                data-item-action={action.id}
                onClick={action.onSelect}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        [...ordinary, ...destructive].map((action) => (
          <Button
            key={action.id}
            intent={action.destructive ? 'destructive' : 'secondary'}
            size="md"
            data-item-action={action.id}
            onClick={action.onSelect}
          >
            {action.label}
          </Button>
        ))
      )}
    </div>
  );
}
