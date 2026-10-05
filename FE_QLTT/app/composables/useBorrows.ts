import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import type {
  BorrowDetail,
  BorrowHistoryItem,
  MessageResponse,
  Paginated,
} from '~/types/api'
import { qk, type BorrowFilter } from '~/lib/query-keys'
import { compactQuery } from '~/lib/utils'

/**
 * Danh sách chi tiết mượn/trả, có MaCTPM nên dùng được cho thao tác trả sách và
 * điều chỉnh tiền phạt. sp_GetBorrowHistory không trả MaCTPM nên không thay thế được.
 */
export function useBorrowList(filter: MaybeRefOrGetter<BorrowFilter> = {}) {
  const { $api } = useNuxtApp()
  return useQuery({
    queryKey: computed(() => qk.borrows.list(toValue(filter))),
    queryFn: () =>
      $api<Paginated<BorrowDetail>>('/borrow', { query: compactQuery(toValue(filter)) }),
  })
}

/** Lịch sử của sinh viên. Bỏ trống maSV thì Backend tự lấy từ token. */
export function useBorrowHistory(maSV: MaybeRefOrGetter<string | undefined> = undefined) {
  const { $api } = useNuxtApp()
  return useQuery({
    queryKey: computed(() => qk.borrows.history(toValue(maSV))),
    queryFn: () =>
      $api<BorrowHistoryItem[]>('/borrow/history', {
        query: compactQuery({ maSV: toValue(maSV) }),
      }),
  })
}

/** Sau khi mượn/trả, tồn kho và thống kê đều đổi nên phải làm mới cùng lúc */
function useBorrowInvalidation() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: qk.borrows.all() })
    qc.invalidateQueries({ queryKey: qk.books.all() })
    qc.invalidateQueries({ queryKey: qk.stats.all() })
    qc.invalidateQueries({ queryKey: qk.students.all() })
  }
}

export function useBorrowBooks() {
  const { $api } = useNuxtApp()
  const invalidate = useBorrowInvalidation()
  return useMutation({
    mutationFn: (payload: { maSV: string; jsonSach: number[]; ngayHenTra: string }) =>
      $api<MessageResponse>('/borrow', { method: 'POST', body: payload }),
    onSuccess(res) {
      toast.success(res.message)
      invalidate()
    },
  })
}

export function useReturnBook() {
  const { $api } = useNuxtApp()
  const invalidate = useBorrowInvalidation()
  return useMutation({
    mutationFn: (maCTPM: number) =>
      $api<MessageResponse>('/return', { method: 'POST', body: { maCTPM } }),
    onSuccess(res) {
      toast.success(res.message)
      invalidate()
    },
  })
}

export function useUpdateFine() {
  const { $api } = useNuxtApp()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      maCTPM,
      tienPhat,
      ghiChu,
    }: {
      maCTPM: number
      tienPhat?: number
      ghiChu?: string
    }) =>
      $api<MessageResponse>(`/borrow/fines/${maCTPM}`, {
        method: 'PUT',
        // Chỉ bỏ field undefined. Chuỗi rỗng phải giữ lại vì đó là thao tác xoá ghi chú.
        body: {
          ...(tienPhat === undefined ? {} : { tienPhat }),
          ...(ghiChu === undefined ? {} : { ghiChu }),
        },
      }),
    onSuccess(res) {
      toast.success(res.message)
      qc.invalidateQueries({ queryKey: qk.borrows.all() })
    },
  })
}
