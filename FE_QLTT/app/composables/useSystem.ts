import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import type { MessageResponse } from '~/types/api'
import { qk } from '~/lib/query-keys'

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
