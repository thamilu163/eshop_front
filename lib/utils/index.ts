import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Time Complexity: O(n) where n is number of class names
// Space Complexity: O(n) for merged string
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Time Complexity: O(1)
// Space Complexity: O(1)
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price);
}

// Convenience wrapper used by customer dashboard for INR formatting
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Time Complexity: O(1)
// Space Complexity: O(1)
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

// Time Complexity: O(1)
// Space Complexity: O(1)
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

// Time Complexity: O(1)
// Space Complexity: O(1)
export function calculateDiscount(price: number, discountPrice?: number): number {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

// Time Complexity: O(1)
// Space Complexity: O(1)
export function isLowStock(quantity: number, threshold: number = 10): boolean {
  return quantity > 0 && quantity <= threshold;
}

// Time Complexity: O(1)
// Space Complexity: O(1)
export function isOutOfStock(quantity: number): boolean {
  return quantity <= 0;
}

// Time Complexity: O(1)
// Space Complexity: O(1)
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Time Complexity: O(1)
// Space Complexity: O(1)
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Time Complexity: O(1)
// Space Complexity: O(1)
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// Time Complexity: O(1)
// Space Complexity: O(1)
export function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ORD-${timestamp}-${random}`;
}
