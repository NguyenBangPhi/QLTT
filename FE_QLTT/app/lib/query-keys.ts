
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
