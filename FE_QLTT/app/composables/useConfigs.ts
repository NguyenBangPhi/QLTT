import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import type { Config, MessageResponse } from '~/types/api'
import { qk } from '~/lib/query-keys'

export function useConfigs() {
  const { $api } = useNuxtApp()
  return useQuery({
    queryKey: qk.configs.all(),
    queryFn: () => $api<Config[]>('/configs'),
    staleTime: 5 * 60_000,
  })
}

export function useUpdateConfig() {
  const { $api } = useNuxtApp()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      $api<MessageResponse>(`/configs/${key}`, { method: 'PUT', body: { value } }),
    onSuccess(res) {
      toast.success(res.message)
      qc.invalidateQueries({ queryKey: qk.configs.all() })
    },
  })
}

/**
 * Đọc một tham số kiểu số từ bảng CauHinh, có giá trị dự phòng khi chưa tải xong.
 *
 * Các con số này chỉ dùng để gợi ý trước cho người dùng (ngày hẹn trả mặc định, tiền phạt
 * dự kiến). Quyết định cuối cùng vẫn do Stored Procedure đưa ra.
 */
export function useConfigNumber(key: string, fallback: number) {
  const { data } = useConfigs()

  return computed(() => {
    const found = data.value?.find((c) => c.TenCauHinh === key)
    const parsed = Number(found?.GiaTri)
    return Number.isFinite(parsed) ? parsed : fallback
  })
}
