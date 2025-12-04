import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes conditionally.
 *
 * Combines `clsx` for conditional class names and `tailwind-merge` to handle conflicts.
 *
 * @param {...ClassValue[]} inputs The class values to merge.
 * @returns {string} The merged class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
