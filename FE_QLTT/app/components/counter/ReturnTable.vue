<script setup lang="ts">
import { RotateCcw, Search } from 'lucide-vue-next'
import { estimateFine, formatCurrency, formatDate } from '~/lib/format'
import type { BorrowingRow } from '~/types/api'

const { data: rows, isPending, error, refetch } = useBorrowingBooks()

const tienPhatMotNgay = useConfigNumber('TIEN_PHAT_MOT_NGAY', 5000)

const keyword = ref('')
const chiQuaHan = ref(false)

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return (rows.value ?? [])
    .filter((r) => !chiQuaHan.value || r.SoNgayQuaHan > 0)
    .filter(
      (r) =>
        !kw ||
        r.TenSinhVien.toLowerCase().includes(kw) ||
        r.MaSV.toLowerCase().includes(kw) ||
        r.TenSach.toLowerCase().includes(kw),
    )
    .sort((a, b) => b.SoNgayQuaHan - a.SoNgayQuaHan)
})

const confirming = ref<BorrowingRow | null>(null)
const dialogOpen = computed({
  get: () => confirming.value !== null,
  set: (v) => {
    if (!v) confirming.value = null
  },
})

const phatDuKien = computed(() =>
  confirming.value ? estimateFine(confirming.value.SoNgayQuaHan, tienPhatMotNgay.value) : 0,
)

const returnBook = useReturnBook()

function confirmReturn() {
  if (!confirming.value) return
  returnBook.mutate(confirming.value.MaCTPM, {
    onSuccess() {
      confirming.value = null
    },
  })
}
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <div class="relative min-w-64 flex-1">
        <Search
          class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <UiInput
          v-model="keyword"
          class="pl-9"
          type="search"
          placeholder="Tìm theo sinh viên hoặc tên sách..."
          aria-label="Tìm trong danh sách đang mượn"
        />
      </div>
      <label class="flex items-center gap-2 text-sm">
        <input v-model="chiQuaHan" type="checkbox" class="size-4 rounded border-input">
        Chỉ hiện sách quá hạn
      </label>
    </div>

    <CommonQueryState
      :pending="isPending"
      :error="error"
      :empty="!filtered.length"
      empty-title="Không có sách nào đang được mượn"
      empty-description="Tất cả sách đều đã được trả về thư viện."
      @retry="refetch()"
    >
      <UiTable>
        <thead>
          <tr>
            <th>Sinh viên</th>
            <th>Sách</th>
            <th>Ngày mượn</th>
            <th>Hẹn trả</th>
            <th class="text-right">Phạt dự kiến</th>
            <th class="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filtered" :key="row.MaCTPM">
            <td>
              <p class="font-medium">{{ row.TenSinhVien }}</p>
              <p class="font-mono text-xs text-muted-foreground">{{ row.MaSV }}</p>
            </td>
            <td class="max-w-56 truncate">{{ row.TenSach }}</td>
            <td class="tabular-nums">{{ formatDate(row.NgayMuon) }}</td>
            <td>
              <div class="flex items-center gap-2">
                <span class="tabular-nums">{{ formatDate(row.NgayHenTra) }}</span>
                <UiBadge v-if="row.SoNgayQuaHan > 0" variant="danger">
                  trễ {{ row.SoNgayQuaHan }} ngày
                </UiBadge>
              </div>
            </td>
            <td class="text-right tabular-nums">
              <span :class="row.SoNgayQuaHan > 0 ? 'font-medium text-danger-soft-foreground' : 'text-muted-foreground'">
                {{ formatCurrency(estimateFine(row.SoNgayQuaHan, tienPhatMotNgay)) }}
              </span>
            </td>
            <td class="text-right">
              <UiButton size="sm" variant="outline" @click="confirming = row">
                <RotateCcw aria-hidden="true" />
                Trả sách
              </UiButton>
            </td>
          </tr>
        </tbody>
      </UiTable>
    </CommonQueryState>

    <UiDialog
      v-model:open="dialogOpen"
      title="Xác nhận trả sách"
      description="Kiểm tra lại thông tin trước khi ghi nhận."
    >
      <dl v-if="confirming" class="space-y-3 text-sm">
        <div class="flex justify-between gap-4">
          <dt class="text-muted-foreground">Sinh viên</dt>
          <dd class="text-right font-medium">
            {{ confirming.TenSinhVien }} ({{ confirming.MaSV }})
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-muted-foreground">Sách</dt>
          <dd class="text-right font-medium">{{ confirming.TenSach }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-muted-foreground">Hẹn trả</dt>
          <dd class="text-right tabular-nums">{{ formatDate(confirming.NgayHenTra) }}</dd>
        </div>
        <div class="flex justify-between gap-4 border-t pt-3">
          <dt class="text-muted-foreground">Tiền phạt dự kiến</dt>
          <dd
            class="text-right text-lg font-semibold tabular-nums"
            :class="phatDuKien > 0 ? 'text-danger-soft-foreground' : ''"
          >
            {{ formatCurrency(phatDuKien) }}
          </dd>
        </div>
        <p v-if="phatDuKien > 0" class="text-xs text-muted-foreground">
          Trễ {{ confirming.SoNgayQuaHan }} ngày × {{ formatCurrency(tienPhatMotNgay) }}/ngày.
          Số tiền chính thức sẽ được hệ thống tính lại khi ghi nhận.
        </p>
      </dl>

      <template #footer>
        <UiButton variant="outline" @click="confirming = null">Huỷ</UiButton>
        <UiButton :loading="returnBook.isPending.value" @click="confirmReturn">
          Xác nhận trả
        </UiButton>
      </template>
    </UiDialog>
  </div>
</template>
