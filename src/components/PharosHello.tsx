import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface PharosHelloProps extends HTMLAttributes<HTMLDivElement> {
  name?: string;
}

export function PharosHello({ name = 'world', className, ...rest }: PharosHelloProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-primary-600 px-4 py-2 text-base-white',
        'shadow-[0_1px_2px_rgba(0,0,0,0.08)]',
        className,
      )}
      {...rest}
    >
      Pharos says hello, {name}.
    </div>
  );
}
