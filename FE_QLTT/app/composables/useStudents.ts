import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import type { MessageResponse, Student } from '~/types/api'
import { qk } from '~/lib/query-keys'
import { compactQuery } from '~/lib/utils'

export function useStudents(keyword: MaybeRefOrGetter<string | undefined> = undefined) {
  const { $api } = useNuxtApp()
  return useQuery({
    queryKey: computed(() => qk.students.list(toValue(keyword))),
    queryFn: () => $api<Student[]>('/students', { query: compactQuery({ keyword: toValue(keyword) }) }),
  })
}

export function useStudent(maSV: MaybeRefOrGetter<string | null | undefined>) {
  const { $api } = useNuxtApp()
  return useQuery({
    queryKey: computed(() => qk.students.detail(toValue(maSV) ?? '')),
    queryFn: () => $api<Student>(`/students/${toValue(maSV)}`),
    enabled: computed(() => Boolean(toValue(maSV))),
  })
}

export function useUpdateCardStatus() {
  const { $api } = useNuxtApp()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ maSV, trangThaiThe }: { maSV: string; trangThaiThe: number }) =>
      $api<MessageResponse>(`/students/${maSV}/card-status`, {
        method: 'PUT',
        body: { trangThaiThe },
      }),
    onSuccess(res) {
      toast.success(res.message)
      qc.invalidateQueries({ queryKey: qk.students.all() })
    },
  })
}
