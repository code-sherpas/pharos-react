// Decision D9: no global stylesheet imported here. Each component imports
// its own `<Component>.module.css`; Vite bundles them all into `dist/styles.css`.
// The published bundle ships zero `@layer` rules, zero preflight, zero global
// resets — only the hashed CSS Modules class names that the components below
// reference at runtime.

export { Button, buttonVariants } from './components/Button';
export type { ButtonProps } from './components/Button';
export { IconButton, iconButtonVariants } from './components/IconButton';
export type { IconButtonProps } from './components/IconButton';
export { Badge, badgeVariants } from './components/Badge';
export type { BadgeProps } from './components/Badge';
export { Input, inputVariants } from './components/Input';
export type { InputProps } from './components/Input';
export { Textarea, textareaVariants } from './components/Textarea';
export type { TextareaProps } from './components/Textarea';
export { Spinner, spinnerVariants } from './components/Spinner';
export type { SpinnerProps } from './components/Spinner';
export { Separator } from './components/Separator';
export type { SeparatorProps } from './components/Separator';
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
} from './components/Card';
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
} from './components/Card';
export { Avatar, AvatarImage, AvatarFallback, AvatarGroup } from './components/Avatar';
export type {
  AvatarProps,
  AvatarImageProps,
  AvatarFallbackProps,
  AvatarGroupProps,
} from './components/Avatar';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from './components/DropdownMenu';
export type {
  DropdownMenuProps,
  DropdownMenuTriggerProps,
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuSeparatorProps,
  DropdownMenuLabelProps,
  DropdownMenuGroupProps,
} from './components/DropdownMenu';
export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
} from './components/Popover';
export type {
  PopoverProps,
  PopoverTriggerProps,
  PopoverContentProps,
  PopoverTitleProps,
  PopoverDescriptionProps,
  PopoverCloseProps,
} from './components/Popover';
export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from './components/Select';
export type {
  SelectProps,
  SelectTriggerProps,
  SelectValueProps,
  SelectContentProps,
  SelectItemProps,
  SelectGroupProps,
  SelectLabelProps,
  SelectSeparatorProps,
} from './components/Select';
export {
  Combobox,
  ComboboxControl,
  ComboboxChips,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxClear,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxSeparator,
} from './components/Combobox';
export type {
  ComboboxProps,
  ComboboxControlProps,
  ComboboxChipsProps,
  ComboboxInputProps,
  ComboboxTriggerProps,
  ComboboxClearProps,
  ComboboxChipProps,
  ComboboxChipRemoveProps,
  ComboboxContentProps,
  ComboboxListProps,
  ComboboxItemProps,
  ComboboxEmptyProps,
  ComboboxGroupProps,
  ComboboxGroupLabelProps,
  ComboboxSeparatorProps,
} from './components/Combobox';
export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
  sheetVariants,
} from './components/Sheet';
export type {
  SheetProps,
  SheetTriggerProps,
  SheetContentProps,
  SheetHeaderProps,
  SheetTitleProps,
  SheetDescriptionProps,
  SheetFooterProps,
  SheetCloseProps,
} from './components/Sheet';
export { cn } from './lib/cn';
