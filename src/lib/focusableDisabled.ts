import type { MouseEvent, MouseEventHandler } from 'react';

/**
 * Whether a control is disabled the focusable way: `aria-disabled="true"`
 * rather than the `disabled` attribute (ARIA APG, "Focusability of disabled
 * controls"). The browser blurs a control the moment it gets `disabled`, so a
 * button that turns busy while it has focus would drop a keyboard user on
 * `<body>`; `aria-disabled` keeps it focusable and announced as unavailable.
 */
export function isAriaDisabled(value: unknown): boolean {
  return value === true || value === 'true';
}

/**
 * Wraps a click handler so a press on an `aria-disabled` control does nothing:
 * the handler is not called and, when the control renders as a link, the
 * navigation is cancelled. Mouse presses never reach it (the CSS sets
 * `pointer-events: none`); this covers Enter and Space from the keyboard.
 */
export function ignorePressWhenAriaDisabled<T extends Element>(
  ariaDisabled: unknown,
  onClick: MouseEventHandler<T> | undefined,
): MouseEventHandler<T> | undefined {
  if (!isAriaDisabled(ariaDisabled)) return onClick;
  return function ignorePress(event: MouseEvent<T>) {
    event.preventDefault();
  };
}
