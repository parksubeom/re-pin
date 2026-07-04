import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind class names: `clsx` resolves conditionals/arrays, then
 * `tailwind-merge` dedupes conflicting utilities (later wins). Use this whenever
 * a component accepts an external `class` prop or composes variant classes.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
