// Regression guard for the empty-barrel bug fixed in fix/dts-rollup-empty.
// vite-plugin-dts with `rollupTypes: true` previously shipped
// `dist/index.d.ts` as a 12-byte `export {}`, so consumers got
// "Module has no exported member 'Button'" at typecheck time even though
// the runtime JS exported everything correctly. The bug was silent
// because `pnpm typecheck` only checks `src/`, not the built artifact.
//
// This file imports each public export from the built `dist/index.js`
// (resolved alongside `dist/index.d.ts`). Any release that fails to
// expose `Button`, `Badge`, their variant helpers, `cn`, or their
// types makes `pnpm verify:dist-types` fail. The check runs in
// `prepublishOnly` and as a CI step, so a regression cannot ship.

import {
  Button,
  buttonVariants,
  Badge,
  badgeVariants,
  IconButton,
  iconButtonVariants,
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  cn,
  type ButtonProps,
  type BadgeProps,
  type IconButtonProps,
  type AvatarProps,
  type AvatarImageProps,
  type AvatarFallbackProps,
  type AvatarGroupProps,
} from '../dist/index.js';

const _button: typeof Button = Button;
const _buttonVariants: typeof buttonVariants = buttonVariants;
const _badge: typeof Badge = Badge;
const _badgeVariants: typeof badgeVariants = badgeVariants;
const _iconButton: typeof IconButton = IconButton;
const _iconButtonVariants: typeof iconButtonVariants = iconButtonVariants;
const _avatar: typeof Avatar = Avatar;
const _avatarImage: typeof AvatarImage = AvatarImage;
const _avatarFallback: typeof AvatarFallback = AvatarFallback;
const _avatarGroup: typeof AvatarGroup = AvatarGroup;
const _cn: typeof cn = cn;
const _buttonProps: ButtonProps = { intent: 'primary', size: 'md' };
const _badgeProps: BadgeProps = { variant: 'success', children: 'ok' };
const _iconButtonProps: IconButtonProps = { intent: 'ghost', size: 'md', 'aria-label': 'Close' };
const _avatarProps: AvatarProps = { size: 'md', shape: 'circle' };
const _avatarImageProps: AvatarImageProps = { src: 'x', alt: 'x' };
const _avatarFallbackProps: AvatarFallbackProps = { delayMs: 0 };
const _avatarGroupProps: AvatarGroupProps = { size: 'sm', max: 3 };

// Touch the bindings so the file is not flagged as unused.
export const _smoke = [
  _button,
  _buttonVariants,
  _badge,
  _badgeVariants,
  _iconButton,
  _iconButtonVariants,
  _avatar,
  _avatarImage,
  _avatarFallback,
  _avatarGroup,
  _cn,
  _buttonProps,
  _badgeProps,
  _iconButtonProps,
  _avatarProps,
  _avatarImageProps,
  _avatarFallbackProps,
  _avatarGroupProps,
];
