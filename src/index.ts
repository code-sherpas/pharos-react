// Decision D9: no global stylesheet imported here. Each component imports
// its own `<Component>.module.css`; Vite bundles them all into `dist/styles.css`.
// The published bundle ships zero `@layer` rules, zero preflight, zero global
// resets — only the hashed CSS Modules class names that the components below
// reference at runtime.

export { Button, buttonVariants } from './components/Button';
export type { ButtonProps } from './components/Button';
export { Badge, badgeVariants } from './components/Badge';
export type { BadgeProps } from './components/Badge';
export { Input, inputVariants } from './components/Input';
export type { InputProps } from './components/Input';
export { Separator } from './components/Separator';
export type { SeparatorProps } from './components/Separator';
export { cn } from './lib/cn';
