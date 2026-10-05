import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import type { Book, MessageResponse } from '~/types/api'
import { qk, type BookFilter } from '~/lib/query-keys'
import { compactQuery } from '~/lib/utils'

export interface BookPayload {
  ISBN: string
  TenSach: string
  MaTacGia: number
  MaTheLoai: number
  NhaXuatBan?: string | null
  NamXuatBan?: number | null
  SoLuongTong: number
}

export function useBooks(filter: MaybeRefOrGetter<BookFilter> = {}) {
  const { $api } = useNuxtApp()
  return useQuery({
    queryKey: computed(() => qk.books.list(toValue(filter))),
    queryFn: () => $api<Book[]>('/books', { query: compactQuery(toValue(filter)) }),
  })
}

export function useBook(id: MaybeRefOrGetter<number>) {
  const { $api } = useNuxtApp()
  return useQuery({
    queryKey: computed(() => qk.books.detail(toValue(id))),
    queryFn: () => $api<Book>(`/books/${toValue(id)}`),
    enabled: computed(() => Number.isFinite(toValue(id))),
  })
}

export function useCreateBook() {
  const { $api } = useNuxtApp()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: BookPayload) =>
      $api<MessageResponse>('/books', { method: 'POST', body: payload }),
    onSuccess(res) {
      toast.success(res.message)
      qc.invalidateQueries({ queryKey: qk.books.all() })
    },
  })
}

export function useUpdateBook() {
  const { $api } = useNuxtApp()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<BookPayload> }) =>
      $api<MessageResponse>(`/books/${id}`, { method: 'PUT', body: payload }),
    onSuccess(res) {
      toast.success(res.message)
      qc.invalidateQueries({ queryKey: qk.books.all() })
      qc.invalidateQueries({ queryKey: qk.logs.all() })
    },
  })
}

export function useDeleteBook() {
  const { $api } = useNuxtApp()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => $api<MessageResponse>(`/books/${id}`, { method: 'DELETE' }),
    onSuccess(res) {
      toast.success(res.message)
      qc.invalidateQueries({ queryKey: qk.books.all() })
      qc.invalidateQueries({ queryKey: qk.logs.all() })
    },
  })
}
