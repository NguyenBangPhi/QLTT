import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Bỏ các tham số rỗng trước khi gắn vào query string.
 * Cần thiết vì ParseIntPipe của Backend sẽ ném 400 nếu nhận chuỗi rỗng.
 */
export function compactQuery<T extends object>(params: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  )
}

