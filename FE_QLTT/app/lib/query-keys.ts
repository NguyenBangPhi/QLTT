/**
 * Toàn bộ query key gom về một chỗ.
 *
 * Lý do: sau mỗi mutation phải làm mới đúng tập dữ liệu liên quan. Ví dụ lập phiếu mượn
 * xong thì tồn kho sách đổi, thống kê đang mượn đổi, và số sách đang mượn của sinh viên
 * đó cũng đổi. Có factory tập trung thì invalidate chính xác từng nhánh, thay vì gọi
 * invalidateQueries() trắng làm toàn bộ màn hình chớp nháy.
 */

export interface BookFilter {
  keyword?: string
  maTacGia?: number
  maTheLoai?: number
}

export interface BorrowFilter {
  maSV?: string
  keyword?: string
  trangThai?: number
  page?: number
  limit?: number
}

export const qk = {
  me: () => ['me'] as const,

  books: {
    all: () => ['books'] as const,
    list: (filter: BookFilter) => ['books', 'list', filter] as const,
    detail: (id: number) => ['books', 'detail', id] as const,
  },

  authors: {
    all: () => ['authors'] as const,
    list: () => ['authors', 'list'] as const,
  },

  genres: {
    all: () => ['genres'] as const,
    list: () => ['genres', 'list'] as const,
  },

  students: {
    all: () => ['students'] as const,
    list: (keyword?: string) => ['students', 'list', keyword ?? ''] as const,
    detail: (maSV: string) => ['students', 'detail', maSV] as const,
  },

  users: {
    all: () => ['users'] as const,
    list: () => ['users', 'list'] as const,
  },

  borrows: {
    all: () => ['borrows'] as const,
    list: (filter: BorrowFilter) => ['borrows', 'list', filter] as const,
    history: (maSV?: string) => ['borrows', 'history', maSV ?? 'me'] as const,
  },

  stats: {
    all: () => ['stats'] as const,
    borrowing: () => ['stats', 'borrowing'] as const,
    overdue: () => ['stats', 'overdue'] as const,
  },

  configs: {
    all: () => ['configs'] as const,
  },

  logs: {
    all: () => ['logs'] as const,
    list: (page: number, limit: number) => ['logs', 'list', page, limit] as const,
  },

  notifications: {
    all: () => ['notifications'] as const,
  },
} as const
