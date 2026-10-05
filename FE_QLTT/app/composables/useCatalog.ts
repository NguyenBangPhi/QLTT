import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import type { Author, Genre, MessageResponse } from '~/types/api'
import { qk } from '~/lib/query-keys'

export function useAuthors() {
  const { $api } = useNuxtApp()
  return useQuery({
    queryKey: qk.authors.list(),
    queryFn: () => $api<Author[]>('/authors'),
    staleTime: 5 * 60_000,
  })
}

export function useGenres() {
  const { $api } = useNuxtApp()
  return useQuery({
    queryKey: qk.genres.list(),
    queryFn: () => $api<Genre[]>('/genres'),
    staleTime: 5 * 60_000,
  })
}

function useCatalogCrud<TPayload extends Record<string, string>>(
  resource: 'authors' | 'genres',
  invalidate: () => readonly unknown[],
) {
  const { $api } = useNuxtApp()
  const qc = useQueryClient()

  const basePath: string = `/${resource}`

  const refresh = () => {
    qc.invalidateQueries({ queryKey: invalidate() })
    qc.invalidateQueries({ queryKey: qk.books.all() })
  }

  const create = useMutation({
    mutationFn: (payload: TPayload) => $api<unknown>(basePath, { method: 'POST', body: payload }),
    onSuccess() {
      toast.success('Thêm thành công')
      refresh()
    },
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TPayload }) =>
      $api<unknown>(`${basePath}/${id}`, { method: 'PUT', body: payload }),
    onSuccess() {
      toast.success('Cập nhật thành công')
      refresh()
    },
  })

  const remove = useMutation({
    mutationFn: (id: number) => $api<MessageResponse>(`${basePath}/${id}`, { method: 'DELETE' }),
    onSuccess(res) {
      toast.success(res.message)
      refresh()
    },
  })

  return { create, update, remove }
}

export function useAuthorCrud() {
  return useCatalogCrud<{ TenTacGia: string }>('authors', qk.authors.all)
}

export function useGenreCrud() {
  return useCatalogCrud<{ TenTheLoai: string }>('genres', qk.genres.all)
}
