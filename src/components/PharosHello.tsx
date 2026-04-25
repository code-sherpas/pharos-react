import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import styles from './PharosHello.module.css';

export interface PharosHelloProps extends HTMLAttributes<HTMLDivElement> {
  name?: string;
}

export function PharosHello({ name = 'world', className, ...rest }: PharosHelloProps) {
  return (
    <div className={cn(styles.hello, className)} {...rest}>
      Pharos says hello, {name}.
    </div>
  );
}
