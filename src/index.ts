// Decision D9: no global stylesheet imported here. Each component imports
// its own `<Component>.module.css`; Vite bundles them all into `dist/styles.css`.
// The published bundle ships zero `@layer` rules, zero preflight, zero global
// resets — only the hashed CSS Modules class names that the components below
// reference at runtime.

export { Button, buttonVariants } from './components/Button';
export type { ButtonProps } from './components/Button';
export { PharosHello } from './components/PharosHello';
export type { PharosHelloProps } from './components/PharosHello';
export { cn } from './lib/cn';
