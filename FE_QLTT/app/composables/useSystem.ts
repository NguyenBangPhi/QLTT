import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { format } from 'date-fns'
import type { ImportResult, MessageResponse } from '~/types/api'
import { qk } from '~/lib/query-keys'
import { normalizeBlobError, saveBlob } from '~/lib/download'
import { useAuthStore } from '~/stores/auth'

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

function stampedName(prefix: string, extension: string) {
  return `${prefix}-${format(new Date(), 'yyyyMMdd-HHmm')}.${extension}`
}

export function useDataTransfer() {
  const { $api } = useNuxtApp()
  const qc = useQueryClient()
  const auth = useAuthStore()

  async function download(path: string, filename: string) {
    try {
      saveBlob(await $api<Blob>(path, { method: 'POST', responseType: 'blob' }), filename)
    } catch (err) {
      throw await normalizeBlobError(err)
    }
  }

  function upload<T>(path: string, file: File) {
    const body = new FormData()
    body.append('file', file)
    return $api<T>(path, { method: 'POST', body })
  }

  const backup = useMutation({
    mutationFn: () => download('/system/backup', stampedName('qltt-backup', 'sql')),
    onSuccess: () => toast.success('Đã tải file sao lưu'),
  })

  const exportData = useMutation({
    mutationFn: () => download('/system/export', stampedName('qltt-export', 'xlsx')),
    onSuccess: () => toast.success('Đã tải file dữ liệu'),
  })

  const restore = useMutation({
    mutationFn: (file: File) => upload<MessageResponse>('/system/restore', file),
    async onSuccess(res) {
      toast.success(res.message)
      await qc.invalidateQueries()
      await auth.fetchMe().catch(() => undefined)
    },
  })

  const importBooks = useMutation({
    mutationFn: (file: File) => upload<ImportResult>('/system/import', file),
    onSuccess(res) {
      const imported = res.sheets.reduce((sum, s) => sum + s.imported, 0)
      if (imported > 0) toast.success(res.message)
      else toast.warning(res.message)
      qc.invalidateQueries({ queryKey: qk.books.all() })
      qc.invalidateQueries({ queryKey: qk.genres.all() })
      qc.invalidateQueries({ queryKey: qk.logs.all() })
    },
  })

  return { backup, exportData, restore, importBooks }
}
