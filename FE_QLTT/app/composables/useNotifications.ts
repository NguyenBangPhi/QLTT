import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MessageResponse, Notification } from '~/types/api'
import { qk } from '~/lib/query-keys'

export function useNotifications() {
  const auth = useAuthStore()
  const { $api } = useNuxtApp()
  return useQuery({
    queryKey: qk.notifications.all(),
    queryFn: () => $api<Notification[]>('/notifications'),
    // Backend khoá endpoint này cho vai trò Sinh viên, gọi bằng vai trò khác sẽ nhận 403
    enabled: computed(() => auth.isStudent),
  })
}

export function useUnreadCount() {
  const { data } = useNotifications()
  return computed(() => data.value?.filter((n) => n.DaDoc === 0).length ?? 0)
}

export function useMarkNotificationRead() {
  const { $api } = useNuxtApp()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      $api<MessageResponse>(`/notifications/${id}/read`, { method: 'PUT' }),

    // Cập nhật lạc quan: đánh dấu đã đọc phản hồi tức thì, lỗi thì trả lại như cũ
    async onMutate(id) {
      await qc.cancelQueries({ queryKey: qk.notifications.all() })
      const previous = qc.getQueryData<Notification[]>(qk.notifications.all())
      qc.setQueryData<Notification[]>(qk.notifications.all(), (old) =>
        old?.map((n) => (n.MaThongBao === id ? { ...n, DaDoc: 1 } : n)),
      )
      return { previous }
    },
    onError(_err, _id, context) {
      if (context?.previous) {
        qc.setQueryData(qk.notifications.all(), context.previous)
      }
    },
    onSettled() {
      qc.invalidateQueries({ queryKey: qk.notifications.all() })
    },
  })
}
