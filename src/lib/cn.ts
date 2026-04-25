import { clsx, type ClassValue } from 'clsx';

/**
 * Merge a list of class-name inputs into a single string.
 *
 * `clsx`-only by design (Decision D9): pharos-react no longer ships Tailwind
 * classes, so the previous `twMerge` step was wrapping each call with a
 * Tailwind-conflict resolver that nothing in the bundle benefited from.
 *
 * Consumers that build with Tailwind and want the conflict-resolution
 * behavior should keep using their own `tailwind-merge` helper alongside
 * Pharos components — `<Button className={twMerge(myClasses)} />` works
 * because Pharos-side class names are CSS Modules hashes that no Tailwind
 * resolver will ever try to deduplicate.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
