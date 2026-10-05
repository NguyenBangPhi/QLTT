import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'

function toDate(value: string | Date): Date {
  if (value instanceof Date) return value
  return parseISO(value.includes(' ') ? value.replace(' ', 'T') : value)
}

const EMPTY = '—'

export function formatCurrency(amount: number | null | undefined): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount ?? 0)
}

export function formatDate(value: string | Date | null | undefined): string {
  return value ? format(toDate(value), 'dd/MM/yyyy') : EMPTY
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return value ? format(toDate(value), 'HH:mm · dd/MM/yyyy') : EMPTY
}

export function isoDateFromToday(days = 0): string {
  return format(addDays(new Date(), days), 'yyyy-MM-dd')
}

export function daysUntil(value: string | Date): number {
  return differenceInCalendarDays(toDate(value), new Date())
}

export type BorrowStatus = 'returned' | 'overdue' | 'due-soon' | 'active'

export function borrowStatus(
  row: { TrangThai: number; NgayHenTra: string },
  soNgayNhacTruoc = 2,
): BorrowStatus {
  if (row.TrangThai === 0) return 'returned'
  const remaining = daysUntil(row.NgayHenTra)
  if (remaining < 0) return 'overdue'
  if (remaining <= soNgayNhacTruoc) return 'due-soon'
  return 'active'
}

export const BORROW_STATUS_LABEL: Record<BorrowStatus, string> = {
  returned: 'Đã trả',
  overdue: 'Quá hạn',
  'due-soon': 'Sắp đến hạn',
  active: 'Đang mượn',
}

export function estimateFine(soNgayQuaHan: number, tienPhatMotNgay: number): number {
  return Math.max(soNgayQuaHan, 0) * tienPhatMotNgay
}
