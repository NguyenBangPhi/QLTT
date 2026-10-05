import { useQuery } from '@tanstack/vue-query'
import type { BorrowingRow } from '~/types/api'
import { qk } from '~/lib/query-keys'

/** View vw_SachDangMuon — nguồn duy nhất có MaCTPM của sách đang được giữ */
export function useBorrowingBooks() {
  const { $api } = useNuxtApp()
  return useQuery({
    queryKey: qk.stats.borrowing(),
    queryFn: () => $api<BorrowingRow[]>('/stats/borrowing'),
  })
}

/** View vw_SachQuaHan */
export function useOverdueBooks() {
  const { $api } = useNuxtApp()
  return useQuery({
    queryKey: qk.stats.overdue(),
    queryFn: () => $api<BorrowingRow[]>('/stats/overdue'),
  })
}
