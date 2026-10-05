<script setup lang="ts">
import { Pencil, Search } from 'lucide-vue-next'
import { formatCurrency, formatDate } from '~/lib/format'
import type { BorrowDetail } from '~/types/api'

/**
 * Chỉ GET /api/borrow mới trả MaCTPM của những cuốn đã trả — sp_GetBorrowHistory không có
 * trường này nên không dùng để điều chỉnh tiền phạt được.
 *
 * Trigger trg_PreventDuplicateReturn chặn mọi thay đổi khác ngoài TienPhat trên dòng đã
 * trả, nên form này chỉ mở đúng hai ô: tiền phạt và ghi chú.
 */
const LIMIT = 20
const page = ref(1)
const keyword = ref('')
const debouncedKeyword = refDebounced(keyword, 300)

// Tìm kiếm chạy ở phía máy chủ chứ không lọc trên mảng đã tải về, nếu không ô tìm kiếm
// chỉ soi được đúng trang đang mở mà người dùng lại tưởng là tìm toàn bộ.
const filter = computed(() => ({
  trangThai: 0,
  keyword: debouncedKeyword.value.trim() || undefined,
  page: page.value,
  limit: LIMIT,
}))

// Đổi từ khoá mà vẫn ở trang 5 thì nhiều khả năng rơi vào trang rỗng
watch(debouncedKeyword, () => {
  page.value = 1
})

const { data, isPending, error, refetch } = useBorrowList(filter)
const rows = computed(() => data.value?.data ?? [])
const totalPages = computed(() => Math.max(1, Math.ceil((data.value?.total ?? 0) / LIMIT)))

const editing = ref<BorrowDetail | null>(null)
// Ô nhập số trả về kiểu số, nhưng khi người dùng xoá trắng thì lại là chuỗi rỗng
const tienPhat = ref<number | string>(0)
const ghiChu = ref('')

const dialogOpen = computed({
  get: () => editing.value !== null,
  set: (v) => {
    if (!v) editing.value = null
  },
})

function startEdit(row: BorrowDetail) {
  editing.value = row
  tienPhat.value = row.TienPhat
  ghiChu.value = row.GhiChu ?? ''
}

const updateFine = useUpdateFine()

function save() {
  if (!editing.value) return
  // Ô để trống hiểu là 0; chặn số âm vì cột TienPhat không nhận giá trị âm
  const value = Math.max(0, Math.round(Number(tienPhat.value) || 0))
  updateFine.mutate(
    { maCTPM: editing.value.MaCTPM, tienPhat: value, ghiChu: ghiChu.value },
    { onSuccess: () => (editing.value = null) },
  )
}
</script>

<template>
  <div>
    <div class="relative mb-4 max-w-md">
      <Search
        class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <UiInput
        v-model="keyword"
        class="pl-9"
        type="search"
        placeholder="Tìm theo sinh viên hoặc tên sách..."
        aria-label="Tìm trong danh sách đã trả"
      />
    </div>

    <CommonQueryState
      :pending="isPending"
      :error="error"
      :empty="!rows.length"
      empty-title="Chưa có cuốn sách nào được trả"
      empty-description="Danh sách này chỉ hiện những cuốn đã hoàn tất trả."
      @retry="refetch()"
    >
      <UiTable>
        <thead>
          <tr>
            <th>Sinh viên</th>
            <th>Sách</th>
            <th>Hẹn trả</th>
            <th>Đã trả</th>
            <th class="text-right">Tiền phạt</th>
            <th>Ghi chú</th>
            <th class="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.MaCTPM">
            <td>
              <p class="font-medium">{{ row.TenSinhVien }}</p>
              <p class="font-mono text-xs text-muted-foreground">{{ row.MaSV }}</p>
            </td>
            <td class="max-w-52 truncate">{{ row.TenSach }}</td>
            <td class="tabular-nums">{{ formatDate(row.NgayHenTra) }}</td>
            <td>
              <div class="flex items-center gap-2">
                <span class="tabular-nums">{{ formatDate(row.NgayTraThucTe) }}</span>
                <UiBadge v-if="row.SoNgayQuaHan > 0" variant="danger">
                  trễ {{ row.SoNgayQuaHan }}
                </UiBadge>
              </div>
            </td>
            <td class="text-right font-medium tabular-nums">{{ formatCurrency(row.TienPhat) }}</td>
            <td class="max-w-44 truncate text-muted-foreground">{{ row.GhiChu || '—' }}</td>
            <td class="text-right">
              <UiButton size="sm" variant="outline" @click="startEdit(row)">
                <Pencil aria-hidden="true" />
                Sửa
              </UiButton>
            </td>
          </tr>
        </tbody>
      </UiTable>

      <div v-if="totalPages > 1" class="mt-4 flex items-center justify-between gap-3">
        <p class="text-sm text-muted-foreground">
          Trang {{ page }}/{{ totalPages }} · {{ data?.total }} bản ghi
        </p>
        <div class="flex gap-2">
          <UiButton variant="outline" size="sm" :disabled="page <= 1" @click="page--">
            Trước
          </UiButton>
          <UiButton variant="outline" size="sm" :disabled="page >= totalPages" @click="page++">
            Sau
          </UiButton>
        </div>
      </div>
    </CommonQueryState>

    <UiDialog
      v-model:open="dialogOpen"
      title="Điều chỉnh tiền phạt"
      :description="editing ? `${editing.TenSach} — ${editing.TenSinhVien}` : ''"
    >
      <div class="space-y-4">
        <div class="space-y-1.5">
          <label for="tien-phat" class="text-sm font-medium">Tiền phạt (VNĐ)</label>
          <UiInput id="tien-phat" v-model="tienPhat" type="number" min="0" step="1000" />
          <p class="text-xs text-muted-foreground">
            Hiện tại: {{ formatCurrency(editing?.TienPhat ?? 0) }}
          </p>
        </div>

        <div class="space-y-1.5">
          <label for="ghi-chu" class="text-sm font-medium">Ghi chú</label>
          <UiTextarea
            id="ghi-chu"
            v-model="ghiChu"
            placeholder="Ví dụ: bìa sách bị rách, phạt thêm"
          />
          <p class="text-xs text-muted-foreground">
            Ghi chú lưu ở cấp phiếu mượn #{{ editing?.MaPhieuMuon }}, áp dụng cho cả phiếu.
          </p>
        </div>
      </div>

      <template #footer>
        <UiButton variant="outline" @click="editing = null">Huỷ</UiButton>
        <UiButton :loading="updateFine.isPending.value" @click="save">Lưu thay đổi</UiButton>
      </template>
    </UiDialog>
  </div>
</template>
