<script setup lang="ts">
import { AlertTriangle, BookMarked, Coins } from 'lucide-vue-next'
import { borrowStatus, formatCurrency, formatDate } from '~/lib/format'
import type { BorrowHistoryItem } from '~/types/api'

definePageMeta({ layout: 'client', roles: ['Sinh viên'] })
useHead({ title: 'Mượn trả của tôi · Thư viện Đại học' })

const { data: history, isPending, error, refetch } = useBorrowHistory()

const phieuMuon = computed(() => {
  const groups = new Map<number, { MaPhieuMuon: number; NgayMuon: string; sach: BorrowHistoryItem[] }>()
  for (const row of history.value ?? []) {
    const group = groups.get(row.MaPhieuMuon)
    if (group) group.sach.push(row)
    else groups.set(row.MaPhieuMuon, { MaPhieuMuon: row.MaPhieuMuon, NgayMuon: row.NgayMuon, sach: [row] })
  }
  return [...groups.values()].sort((a, b) => b.MaPhieuMuon - a.MaPhieuMuon)
})

const dangGiu = computed(() => (history.value ?? []).filter((r) => r.TrangThai === 1))
const quaHan = computed(() => dangGiu.value.filter((r) => borrowStatus(r) === 'overdue'))
const tongPhat = computed(() =>
  (history.value ?? []).reduce((sum, r) => sum + (r.TienPhat ?? 0), 0),
)
</script>

<template>
  <div>
    <CommonPageHeader
      title="Mượn trả của tôi"
      description="Các phiếu mượn đã lập và tình trạng từng cuốn sách"
    />

    <div class="mb-6 grid gap-4 sm:grid-cols-3">
      <CommonStatCard
        label="Đang giữ"
        :value="dangGiu.length"
        :icon="BookMarked"
        tone="success"
        :loading="isPending"
      />
      <CommonStatCard
        label="Quá hạn"
        :value="quaHan.length"
        :icon="AlertTriangle"
        tone="danger"
        :loading="isPending"
        hint="Mỗi ngày trễ sẽ phát sinh tiền phạt"
      />
      <CommonStatCard
        label="Tổng tiền phạt"
        :value="formatCurrency(tongPhat)"
        :icon="Coins"
        tone="warning"
        :loading="isPending"
      />
    </div>

    <CommonQueryState
      :pending="isPending"
      :error="error"
      :empty="!phieuMuon.length"
      empty-title="Bạn chưa mượn cuốn sách nào"
      empty-description="Hãy tìm một cuốn sách ở trang tra cứu và tới quầy thủ thư để mượn."
      @retry="refetch()"
    >
      <template #empty-action>
        <UiButton variant="outline" size="sm" @click="navigateTo('/')">Tra cứu sách</UiButton>
      </template>

      <div class="space-y-4">
        <UiCard v-for="phieu in phieuMuon" :key="phieu.MaPhieuMuon" class="overflow-hidden">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-5 py-3">
            <p class="font-medium">Phiếu mượn #{{ phieu.MaPhieuMuon }}</p>
            <p class="text-sm text-muted-foreground">
              Ngày mượn {{ formatDate(phieu.NgayMuon) }} · {{ phieu.sach.length }} cuốn
            </p>
          </div>

          <ul class="divide-y">
            <li
              v-for="(sach, i) in phieu.sach"
              :key="`${phieu.MaPhieuMuon}-${i}`"
              class="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
            >
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium">{{ sach.TenSach }}</p>
                <p class="mt-0.5 text-sm text-muted-foreground">
                  Hẹn trả {{ formatDate(sach.NgayHenTra) }}
                  <template v-if="sach.NgayTraThucTe">
                    · đã trả {{ formatDate(sach.NgayTraThucTe) }}
                  </template>
                </p>
              </div>

              <div class="flex items-center gap-3">
                <span
                  v-if="sach.TienPhat > 0"
                  class="text-sm font-medium text-danger-soft-foreground tabular-nums"
                >
                  {{ formatCurrency(sach.TienPhat) }}
                </span>
                <BorrowStatusBadge :trang-thai="sach.TrangThai" :ngay-hen-tra="sach.NgayHenTra" />
              </div>
            </li>
          </ul>
        </UiCard>
      </div>
    </CommonQueryState>
  </div>
</template>
