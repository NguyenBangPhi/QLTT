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

/**
 * CRUD tác giả và thể loại dùng chung một khuôn. Khi xoá mà còn sách tham chiếu,
 * MySQL ném lỗi khoá ngoại 23000 và Backend đổi thành 400 — lỗi này được
 * mutationCache toàn cục hiển thị, không cần bắt riêng ở đây.
 */
function useCatalogCrud<TPayload extends Record<string, string>>(
  resource: 'authors' | 'genres',
  invalidate: () => readonly unknown[],
) {
  const { $api } = useNuxtApp()
  const qc = useQueryClient()

  // Phải chú kiểu string tường minh. Nếu để suy luận, `/${resource}` thành union literal
  // "/authors" | "/genres" và bộ kiểm kiểu route của Nuxt sẽ đệ quy quá sâu.
  const basePath: string = `/${resource}`

  const refresh = () => {
    qc.invalidateQueries({ queryKey: invalidate() })
    // Danh sách sách hiển thị kèm tên tác giả và thể loại nên cũng phải làm mới
    qc.invalidateQueries({ queryKey: qk.books.all() })
  }

  const create = useMutation({
    // Phải chỉ kiểu trả về tường minh, nếu không TypeScript sẽ cố suy luận từ bảng route
    // của Nuxt và báo "Excessive stack depth". Kết quả không dùng tới nên để unknown.
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
