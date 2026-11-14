import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Combina clases Tailwind sin conflictos (base shadcn-like). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
