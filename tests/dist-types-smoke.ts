// Regression guard for the published artifact's public surface.
//
// Originally added for the empty-barrel bug (fix/dts-rollup-empty), where
// `dist/index.d.ts` shipped as a 12-byte `export {}` and consumers got
// "Module has no exported member 'Button'" at typecheck time even though the
// runtime JS exported everything. `pnpm typecheck` only checks `src/`, never
// the built artifact, so the bug was silent.
//
// Extended for #80 (per-component RSC build): the library now ships one file
// per atom (`dist/components/Button.js`) with per-file `"use client"`, plus an
// additive deep-import subpath per component in `package.json` `exports`. This
// file asserts, against the BUILT `dist/`, that
//   (1) every public symbol still resolves from the barrel (surface unchanged),
//   (2) every deep-import subpath resolves WITH types.
// Any release that drops a barrel export or breaks a subpath fails
// `pnpm verify:dist-types` — which runs in `prepublishOnly` and CI, so the
// regression cannot ship. Directive placement + single-CSS bundle are checked
// separately by `scripts/verify-dist-rsc.mjs` (`pnpm verify:dist-rsc`).

// (1) Full public surface, from the barrel.
import {
  Button,
  buttonVariants,
  IconButton,
  iconButtonVariants,
  Badge,
  badgeVariants,
  Input,
  inputVariants,
  Textarea,
  textareaVariants,
  Spinner,
  spinnerVariants,
  Separator,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxItem,
  Sheet,
  SheetTrigger,
  SheetContent,
  sheetVariants,
  Dialog,
  DialogTrigger,
  DialogContent,
  Checkbox,
  Switch,
  RadioGroup,
  RadioGroupItem,
  cn,
  type ButtonProps,
  type IconButtonProps,
  type BadgeProps,
  type InputProps,
  type TextareaProps,
  type SpinnerProps,
  type SeparatorProps,
  type CardProps,
  type AvatarProps,
  type SelectProps,
  type ComboboxProps,
  type SheetProps,
  type DialogProps,
  type CheckboxProps,
  type SwitchProps,
  type RadioGroupProps,
  type RadioGroupItemProps,
} from '../dist/index.js';

// (2) Deep-import subpaths (#80): each component's primary symbol (and a type
// for a representative one), resolved from its own subpath, proving the
// `exports` map entry and its per-file `.d.ts` are wired.
import {
  Button as ButtonDeep,
  type ButtonProps as ButtonPropsDeep,
} from '../dist/components/Button.js';
import { IconButton as IconButtonDeep } from '../dist/components/IconButton.js';
import { Badge as BadgeDeep } from '../dist/components/Badge.js';
import { Input as InputDeep } from '../dist/components/Input.js';
import { Textarea as TextareaDeep } from '../dist/components/Textarea.js';
import { Spinner as SpinnerDeep } from '../dist/components/Spinner.js';
import { Separator as SeparatorDeep } from '../dist/components/Separator.js';
import { Card as CardDeep } from '../dist/components/Card.js';
import { Avatar as AvatarDeep } from '../dist/components/Avatar.js';
import { DropdownMenu as DropdownMenuDeep } from '../dist/components/DropdownMenu.js';
import { Popover as PopoverDeep } from '../dist/components/Popover.js';
import { Select as SelectDeep } from '../dist/components/Select.js';
import { Combobox as ComboboxDeep } from '../dist/components/Combobox.js';
import { Sheet as SheetDeep } from '../dist/components/Sheet.js';
import { Dialog as DialogDeep } from '../dist/components/Dialog.js';
import { Checkbox as CheckboxDeep } from '../dist/components/Checkbox.js';
import { Switch as SwitchDeep } from '../dist/components/Switch.js';
import {
  RadioGroup as RadioGroupDeep,
  RadioGroupItem as RadioGroupItemDeep,
} from '../dist/components/RadioGroup.js';

// A couple of representative typed prop checks (surface shape, not just names).
const _buttonProps: ButtonProps = { intent: 'primary', size: 'md' };
const _iconButtonProps: IconButtonProps = { intent: 'ghost', size: 'md', 'aria-label': 'Close' };
const _badgeProps: BadgeProps = { variant: 'success', children: 'ok' };
const _avatarProps: AvatarProps = { size: 'md', shape: 'circle' };
const _switchProps: SwitchProps = { checked: true };
const _radioItemProps: RadioGroupItemProps = { value: 'a' };
const _buttonPropsDeep: ButtonPropsDeep = { intent: 'secondary' };

// Type-level presence guard for the remaining public prop types (referencing
// each here counts as a use, so `noUnusedLocals` / no-unused-vars pass while
// still failing the build if any type disappears from the barrel).
export type _PublicPropTypes = [
  InputProps,
  TextareaProps,
  SpinnerProps,
  SeparatorProps,
  CardProps,
  SelectProps<string>,
  ComboboxProps<string>,
  SheetProps,
  DialogProps,
  CheckboxProps,
  RadioGroupProps,
];

// Touch every binding so nothing is flagged as unused (surface presence check).
export const _smoke = [
  Button,
  buttonVariants,
  IconButton,
  iconButtonVariants,
  Badge,
  badgeVariants,
  Input,
  inputVariants,
  Textarea,
  textareaVariants,
  Spinner,
  spinnerVariants,
  Separator,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxItem,
  Sheet,
  SheetTrigger,
  SheetContent,
  sheetVariants,
  Dialog,
  DialogTrigger,
  DialogContent,
  Checkbox,
  Switch,
  RadioGroup,
  RadioGroupItem,
  cn,
  // deep-import subpaths
  ButtonDeep,
  IconButtonDeep,
  BadgeDeep,
  InputDeep,
  TextareaDeep,
  SpinnerDeep,
  SeparatorDeep,
  CardDeep,
  AvatarDeep,
  DropdownMenuDeep,
  PopoverDeep,
  SelectDeep,
  ComboboxDeep,
  SheetDeep,
  DialogDeep,
  CheckboxDeep,
  SwitchDeep,
  RadioGroupDeep,
  RadioGroupItemDeep,
  _buttonProps,
  _iconButtonProps,
  _badgeProps,
  _avatarProps,
  _switchProps,
  _radioItemProps,
  _buttonPropsDeep,
];
