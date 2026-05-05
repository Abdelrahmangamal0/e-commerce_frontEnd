import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: Date | string | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getOrderStatusLabel(status: number): string {
  const statusMap: Record<number, string> = {
    0: 'Pending',
    1: 'Placed',
    2: 'On Way',
    3: 'Delivered',
    4: 'Cancelled',
    5: 'Refunded',
  };
  return statusMap[status] || 'Unknown';
}

export function getOrderStatusColor(status: number): string {
  const colorMap: Record<number, string> = {
    0: 'bg-yellow-100 text-yellow-800',
    1: 'bg-blue-100 text-blue-800',
    2: 'bg-purple-100 text-purple-800',
    3: 'bg-green-100 text-green-800',
    4: 'bg-red-100 text-red-800',
    5: 'bg-gray-100 text-gray-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}
