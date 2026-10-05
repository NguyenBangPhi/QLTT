<script setup lang="ts">
import { TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { Download } from 'lucide-vue-next'
import { formatDate } from '~/lib/format'
import type { BorrowingRow } from '~/types/api'

definePageMeta({ layout: 'admin', roles: ['Admin', 'Thủ thư'] })
useHead({ title: 'Báo cáo thống kê · Quản trị thư viện' })

const dangMuon = useBorrowingBooks()
const quaHan = useOverdueBooks()

const tab = useTabQuery(['borrowing', 'overdue'])
const current = computed(() => (tab.value === 'borrowing' ? dangMuon : quaHan))

function toCsv(rows: BorrowingRow[]) {
  const header = ['Mã SV', 'Sinh viên', 'ISBN', 'Tên sách', 'Ngày mượn', 'Hẹn trả', 'Số ngày quá hạn']
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const lines = rows.map((r) =>
    [r.MaSV, r.TenSinhVien, r.ISBN, r.TenSach, r.NgayMuon, r.NgayHenTra, r.SoNgayQuaHan]
      .map(escape)
      .join(','),
  )
  return [header.map(escape).join(','), ...lines].join('\n')
}

function exportCsv() {
  const rows = current.value.data.value ?? []
  if (!rows.length) return
  const blob = new Blob(['﻿' + toCsv(rows)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${tab.value === 'borrowing' ? 'sach-dang-muon' : 'sach-qua-han'}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const sorted = computed(() =>
  [...(current.value.data.value ?? [])].sort((a, b) => b.SoNgayQuaHan - a.SoNgayQuaHan),
)
</script>

<template>
  <div>
    <CommonPageHeader
      title="Báo cáo thống kê"
      description="Tình hình sách đang được mượn và sách đã quá hạn trả"
    >
      <template #actions>
        <UiButton variant="outline" :disabled="!sorted.length" @click="exportCsv">
          <Download aria-hidden="true" />
          Xuất CSV
        </UiButton>
      </template>
    </CommonPageHeader>

    <TabsRoot v-model="tab">
      <TabsList class="mb-6 inline-flex gap-1 rounded-lg border bg-muted/50 p-1" aria-label="Loại báo cáo">
        <TabsTrigger
          value="borrowing"
          class="rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
        >
          Đang mượn ({{ dangMuon.data.value?.length ?? 0 }})
        </TabsTrigger>
        <TabsTrigger
          value="overdue"
          class="rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
        >
          Quá hạn ({{ quaHan.data.value?.length ?? 0 }})
        </TabsTrigger>
      </TabsList>

      <div>
        <CommonQueryState
          :pending="current.isPending.value"
          :error="current.error.value"
          :empty="!sorted.length"
          :empty-title="tab === 'borrowing' ? 'Không có sách nào đang được mượn' : 'Không có sách nào quá hạn'"
          @retry="current.refetch()"
        >
          <UiTable>
            <thead>
              <tr>
                <th>Sinh viên</th>
                <th>ISBN</th>
                <th>Tên sách</th>
                <th>Ngày mượn</th>
                <th>Hẹn trả</th>
                <th class="text-right">Quá hạn</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in sorted" :key="row.MaCTPM">
                <td>
                  <p class="font-medium">{{ row.TenSinhVien }}</p>
                  <p class="font-mono text-xs text-muted-foreground">{{ row.MaSV }}</p>
                </td>
                <td class="font-mono text-xs">{{ row.ISBN }}</td>
                <td class="max-w-56 truncate">{{ row.TenSach }}</td>
                <td class="tabular-nums">{{ formatDate(row.NgayMuon) }}</td>
                <td class="tabular-nums">{{ formatDate(row.NgayHenTra) }}</td>
                <td class="text-right">
                  <UiBadge v-if="row.SoNgayQuaHan > 0" variant="danger">
                    {{ row.SoNgayQuaHan }} ngày
                  </UiBadge>
                  <span v-else class="text-sm text-muted-foreground">—</span>
                </td>
              </tr>
            </tbody>
          </UiTable>
        </CommonQueryState>
      </div>
    </TabsRoot>
  </div>
</template>
