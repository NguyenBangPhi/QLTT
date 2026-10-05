import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import type { Paginated, SystemLog } from '~/types/api'
import { qk } from '~/lib/query-keys'

export function useLogs(
  page: MaybeRefOrGetter<number>,
  limit: MaybeRefOrGetter<number> = 20,
) {
  const { $api } = useNuxtApp()
  return useQuery({
    queryKey: computed(() => qk.logs.list(toValue(page), toValue(limit))),
    queryFn: () =>
      $api<Paginated<SystemLog>>('/logs', {
        query: { page: toValue(page), limit: toValue(limit) },
      }),
    // Giữ dữ liệu trang cũ khi chuyển trang để bảng không nhảy về trạng thái rỗng
    placeholderData: keepPreviousData,
  })
}
