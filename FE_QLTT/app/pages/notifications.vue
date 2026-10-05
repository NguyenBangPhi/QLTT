<script setup lang="ts">
import { BellOff, Check, CheckCheck } from 'lucide-vue-next'
import { formatDateTime } from '~/lib/format'

definePageMeta({ layout: 'client', roles: ['Sinh viên'] })
useHead({ title: 'Thông báo · Thư viện Đại học' })

const { data: items, isPending, error, refetch } = useNotifications()
const markRead = useMarkNotificationRead()

const { page, items: pagedItems, total, limit } = usePagedList(items, 20)

const chuaDoc = computed(() => (items.value ?? []).filter((n) => n.DaDoc === 0))

function markAll() {
  for (const n of chuaDoc.value) markRead.mutate(n.MaThongBao)
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <CommonPageHeader title="Thông báo" description="Nhắc trả sách, cảnh báo khoá thẻ và thông báo hệ thống">
      <template #actions>
        <UiButton
          v-if="chuaDoc.length"
          variant="outline"
          size="sm"
          :loading="markRead.isPending.value"
          @click="markAll"
        >
          <CheckCheck aria-hidden="true" />
          Đánh dấu đã đọc tất cả ({{ chuaDoc.length }})
        </UiButton>
      </template>
    </CommonPageHeader>

    <CommonQueryState
      :pending="isPending"
      :error="error"
      :empty="!items?.length"
      empty-title="Chưa có thông báo nào"
      empty-description="Khi sách sắp đến hạn trả, hệ thống sẽ tự động gửi nhắc nhở tới đây."
      @retry="refetch()"
    >
      <template #empty-action>
        <BellOff class="sr-only" aria-hidden="true" />
      </template>

      <ul class="space-y-2">
        <li
          v-for="n in pagedItems"
          :key="n.MaThongBao"
          :class="[
            'flex items-start gap-3 rounded-lg border p-4 transition-colors',
            n.DaDoc === 0 ? 'border-primary/30 bg-accent/40' : 'bg-card',
          ]"
        >
          <span
            :class="[
              'mt-1.5 size-2 shrink-0 rounded-full',
              n.DaDoc === 0 ? 'bg-primary' : 'bg-transparent',
            ]"
            aria-hidden="true"
          />

          <div class="min-w-0 flex-1">
            <p :class="['text-sm', n.DaDoc === 0 ? 'font-medium' : 'text-muted-foreground']">
              {{ n.NoiDung }}
            </p>
            <p class="mt-1 text-xs text-muted-foreground tabular-nums">
              {{ formatDateTime(n.NgayTao) }}
            </p>
          </div>

          <UiButton
            v-if="n.DaDoc === 0"
            variant="ghost"
            size="icon"
            aria-label="Đánh dấu đã đọc"
            @click="markRead.mutate(n.MaThongBao)"
          >
            <Check aria-hidden="true" />
          </UiButton>
        </li>
      </ul>

      <CommonPagination v-model:page="page" :total="total" :limit="limit" />
    </CommonQueryState>
  </div>
</template>
