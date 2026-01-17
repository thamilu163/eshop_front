import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency (Indian Rupees)
 * @param amount - The amount to format
 * @param locale - The locale to use (default: 'en-IN')
 * @param currency - The currency code (default: 'INR')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  locale: string = 'en-IN',
  currency: string = 'INR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
