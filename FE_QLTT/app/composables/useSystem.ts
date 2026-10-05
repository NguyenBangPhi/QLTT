import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import type { MessageResponse } from '~/types/api'
import { qk } from '~/lib/query-keys'

/**
 * Hai tác vụ này gọi sp_LockOverdueAccounts và sp_SendReminder — hai stored procedure
 * dùng CURSOR của đồ án. Bình thường chúng chạy theo lịch cron, nút bấm tay ở đây để
 * demo được kết quả ngay mà không phải chờ tới giờ.
 */
export function useSystemTasks() {
  const { $api } = useNuxtApp()
  const qc = useQueryClient()

  const lockOverdue = useMutation({
    mutationFn: () => $api<MessageResponse>('/system/lock-overdue', { method: 'POST' }),
    onSuccess(res) {
      toast.success(res.message)
      qc.invalidateQueries({ queryKey: qk.students.all() })
    },
  })

  const sendReminders = useMutation({
    mutationFn: () => $api<MessageResponse>('/system/send-reminders', { method: 'POST' }),
    onSuccess(res) {
      toast.success(res.message)
      qc.invalidateQueries({ queryKey: qk.notifications.all() })
    },
  })

  return { lockOverdue, sendReminders }
}
