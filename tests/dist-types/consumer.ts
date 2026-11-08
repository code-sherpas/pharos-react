// What a consumer's TypeScript sees of the published package.
//
// `scripts/verify-dist-types.sh` (`pnpm verify:dist-types`, run by
// `pnpm build`, so by CI, the release and `prepublishOnly`) packs the tarball,
// installs it into a throwaway project and compiles this file there by package
// name, with `skipLibCheck: false`, in `moduleResolution` `bundler`, `node16`
// and `nodenext`. It is never compiled against `dist/` by relative path: that
// skips the `exports` map and the tarball's file list, which are what a
// consumer installs.
//
// It guards, in the order they cost a release:
//   - the empty barrel of 0.2.1 (fix/dts-rollup-empty): `dist/index.d.ts`
//     shipped as `export {}` and every named import failed;
//   - #80: every deep-import subpath resolves with its types (the script also
//     imports every subpath of `exports`, read from `package.json`, so a new
//     one is covered without editing this file);
//   - 0.2.2 to 3.0.2: the `.d.ts` imported each other without a file
//     extension, which node16/nodenext reject (TS2835) and which, with
//     `skipLibCheck: true`, left the whole barrel typed as `any`. The
//     `@ts-expect-error` lines below fail the check if a symbol arrives as
//     `any` again, whatever the cause.

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
  LanguagesIcon,
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
  SidePanel,
  SidePanelTrigger,
  SidePanelContent,
  SidePanelHeader,
  SidePanelTitle,
  SidePanelDescription,
  SidePanelFooter,
  SidePanelClose,
  Dialog,
  DialogTrigger,
  DialogContent,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
  Checkbox,
  Switch,
  RadioGroup,
  RadioGroupItem,
  ToggleGroup,
  ToggleGroupItem,
  ToastProvider,
  Toaster,
  useToast,
  cn,
  type ButtonProps,
  type IconButtonProps,
  type BadgeProps,
  type InputProps,
  type TextareaProps,
  type SpinnerProps,
  type SeparatorProps,
  type LanguagesIconProps,
  type CardProps,
  type AvatarProps,
  type SelectProps,
  type ComboboxProps,
  type SheetProps,
  type SidePanelProps,
  type SidePanelContentProps,
  type DialogProps,
  type AlertDialogProps,
  type AlertDialogActionProps,
  type CheckboxProps,
  type SwitchProps,
  type RadioGroupProps,
  type RadioGroupItemProps,
  type ToggleGroupProps,
  type ToggleGroupItemProps,
  type ToasterProps,
  type ToastOptions,
  type ToastProviderProps,
  type UseToastReturnValue,
} from '@code-sherpas/pharos-react';

// (2) Deep-import subpaths (#80): each component's primary symbol (and a type
// for a representative one), resolved from its own subpath, proving the
// `exports` map entry and its per-file `.d.ts` are wired.
import {
  Button as ButtonDeep,
  type ButtonProps as ButtonPropsDeep,
} from '@code-sherpas/pharos-react/Button';
import { IconButton as IconButtonDeep } from '@code-sherpas/pharos-react/IconButton';
import { Badge as BadgeDeep } from '@code-sherpas/pharos-react/Badge';
import { Input as InputDeep } from '@code-sherpas/pharos-react/Input';
import { Textarea as TextareaDeep } from '@code-sherpas/pharos-react/Textarea';
import { Spinner as SpinnerDeep } from '@code-sherpas/pharos-react/Spinner';
import { Separator as SeparatorDeep } from '@code-sherpas/pharos-react/Separator';
import { LanguagesIcon as LanguagesIconDeep } from '@code-sherpas/pharos-react/LanguagesIcon';
import { Card as CardDeep } from '@code-sherpas/pharos-react/Card';
import { Avatar as AvatarDeep } from '@code-sherpas/pharos-react/Avatar';
import { DropdownMenu as DropdownMenuDeep } from '@code-sherpas/pharos-react/DropdownMenu';
import { Popover as PopoverDeep } from '@code-sherpas/pharos-react/Popover';
import { Select as SelectDeep } from '@code-sherpas/pharos-react/Select';
import { Combobox as ComboboxDeep } from '@code-sherpas/pharos-react/Combobox';
import { Sheet as SheetDeep } from '@code-sherpas/pharos-react/Sheet';
import { SidePanel as SidePanelDeep } from '@code-sherpas/pharos-react/SidePanel';
import { Dialog as DialogDeep } from '@code-sherpas/pharos-react/Dialog';
import {
  AlertDialog as AlertDialogDeep,
  type AlertDialogActionProps as AlertDialogActionPropsDeep,
} from '@code-sherpas/pharos-react/AlertDialog';
import { Checkbox as CheckboxDeep } from '@code-sherpas/pharos-react/Checkbox';
import { Switch as SwitchDeep } from '@code-sherpas/pharos-react/Switch';
import {
  RadioGroup as RadioGroupDeep,
  RadioGroupItem as RadioGroupItemDeep,
} from '@code-sherpas/pharos-react/RadioGroup';
import { Toaster as ToasterDeep } from '@code-sherpas/pharos-react/Toast';
import {
  ToggleGroup as ToggleGroupDeep,
  ToggleGroupItem as ToggleGroupItemDeep,
} from '@code-sherpas/pharos-react/ToggleGroup';

// A couple of representative typed prop checks (surface shape, not just names).
const _buttonProps: ButtonProps = { intent: 'primary', size: 'md' };
const _iconButtonProps: IconButtonProps = { intent: 'ghost', size: 'md', 'aria-label': 'Close' };
const _badgeProps: BadgeProps = { variant: 'success', children: 'ok' };
const _avatarProps: AvatarProps = { size: 'md', shape: 'circle' };
const _switchProps: SwitchProps = { checked: true };
const _radioItemProps: RadioGroupItemProps = { value: 'a' };
const _toggleGroupProps: ToggleGroupProps = { size: 'sm', defaultValue: ['list'] };
const _toggleGroupItemProps: ToggleGroupItemProps = { value: 'list' };
const _toasterProps: ToasterProps = {
  position: 'top-center',
  label: 'Notifications',
  closeLabel: 'Close',
};
const _toastOptions: ToastOptions = { title: 'Saved', variant: 'success' };
const _alertDialogActionProps: AlertDialogActionProps = { intent: 'destructive' };
const _buttonPropsDeep: ButtonPropsDeep = { intent: 'secondary' };

// A symbol typed as `any` accepts anything, so each line below stops being an
// error and its `@ts-expect-error` fails the check (TS2578): the barrel, a
// subpath, and a type one subpath's `.d.ts` imports from another.
// @ts-expect-error -- `Button` is a component, not a number.
const _buttonIsNotAny: number = Button;
// @ts-expect-error -- `Sheet` from the barrel is a component, not a number.
const _sheetIsNotAny: number = Sheet;
// @ts-expect-error -- `SidePanel` from its subpath is a component, not a number.
const _sidePanelDeepIsNotAny: number = SidePanelDeep;
// The AlertDialog subpath takes `ButtonProps` from `./Button`, whose intents
// are a closed set.
const _alertDialogActionDeepIntentIsChecked: AlertDialogActionPropsDeep = {
  // @ts-expect-error -- not one of the intents.
  intent: 'not-an-intent',
};

// Type-level presence guard for the remaining public prop types (referencing
// each here counts as a use, so `noUnusedLocals` / no-unused-vars pass while
// still failing the build if any type disappears from the barrel).
export type _PublicPropTypes = [
  InputProps,
  TextareaProps,
  SpinnerProps,
  SeparatorProps,
  LanguagesIconProps,
  CardProps,
  SelectProps<string>,
  ComboboxProps<string>,
  SheetProps,
  SidePanelProps,
  SidePanelContentProps,
  DialogProps,
  AlertDialogProps,
  CheckboxProps,
  RadioGroupProps,
  ToggleGroupProps,
  ToastProviderProps,
  UseToastReturnValue,
];

// Touch every binding so nothing is flagged as unused (surface presence check).
export const _smoke = [
  _buttonIsNotAny,
  _sheetIsNotAny,
  _sidePanelDeepIsNotAny,
  _alertDialogActionDeepIntentIsChecked,
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
  LanguagesIcon,
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
  SidePanel,
  SidePanelTrigger,
  SidePanelContent,
  SidePanelHeader,
  SidePanelTitle,
  SidePanelDescription,
  SidePanelFooter,
  SidePanelClose,
  Dialog,
  DialogTrigger,
  DialogContent,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
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
  LanguagesIconDeep,
  CardDeep,
  AvatarDeep,
  DropdownMenuDeep,
  PopoverDeep,
  SelectDeep,
  ComboboxDeep,
  SheetDeep,
  SidePanelDeep,
  DialogDeep,
  AlertDialogDeep,
  _alertDialogActionProps,
  CheckboxDeep,
  SwitchDeep,
  RadioGroupDeep,
  RadioGroupItemDeep,
  ToggleGroupDeep,
  ToggleGroupItemDeep,
  ToggleGroup,
  ToggleGroupItem,
  _toggleGroupProps,
  _toggleGroupItemProps,
  ToasterDeep,
  ToastProvider,
  Toaster,
  useToast,
  _toasterProps,
  _toastOptions,
  _buttonProps,
  _iconButtonProps,
  _badgeProps,
  _avatarProps,
  _switchProps,
  _radioItemProps,
  _buttonPropsDeep,
];
