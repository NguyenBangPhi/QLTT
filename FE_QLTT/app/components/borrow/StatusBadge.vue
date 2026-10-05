<script setup lang="ts">
import { AlertTriangle, CheckCircle2, Clock, BookMarked } from 'lucide-vue-next'
import { BORROW_STATUS_LABEL, borrowStatus } from '~/lib/format'

const props = withDefaults(
  defineProps<{
    trangThai: number
    ngayHenTra: string
    soNgayNhacTruoc?: number
  }>(),
  { soNgayNhacTruoc: 2 },
)

const status = computed(() =>
  borrowStatus({ TrangThai: props.trangThai, NgayHenTra: props.ngayHenTra }, props.soNgayNhacTruoc),
)

const variant = computed(
  () =>
    ({
      returned: 'secondary',
      overdue: 'danger',
      'due-soon': 'warning',
      active: 'success',
    })[status.value] as 'secondary' | 'danger' | 'warning' | 'success',
)

const icon = computed(
  () =>
    ({
      returned: CheckCircle2,
      overdue: AlertTriangle,
      'due-soon': Clock,
      active: BookMarked,
    })[status.value],
)
</script>

<template>
  <UiBadge :variant="variant">
    <component :is="icon" class="size-3" aria-hidden="true" />
    {{ BORROW_STATUS_LABEL[status] }}
  </UiBadge>
</template>
