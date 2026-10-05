import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import type { MessageResponse, User } from '~/types/api'
import { qk } from '~/lib/query-keys'

export function useUsers() {
  const { $api } = useNuxtApp()
  return useQuery({
    queryKey: qk.users.list(),
    queryFn: () => $api<User[]>('/users'),
  })
}

export function useUpdateUserStatus() {
  const { $api } = useNuxtApp()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, trangThai }: { id: number; trangThai: number }) =>
      $api<MessageResponse>(`/users/${id}/status`, { method: 'PUT', body: { trangThai } }),
    onSuccess(res) {
      toast.success(res.message)
      qc.invalidateQueries({ queryKey: qk.users.all() })
      qc.invalidateQueries({ queryKey: qk.students.all() })
    },
  })
}
