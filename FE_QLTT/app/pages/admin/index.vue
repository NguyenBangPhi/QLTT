<script setup lang="ts">
import { AlertTriangle, BookOpen, BookMarked, PackageX } from 'lucide-vue-next'
import { formatDate } from '~/lib/format'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'admin', roles: ['Admin', 'Thủ thư'] })
useHead({ title: 'Tổng quan · Quản trị thư viện' })

const auth = useAuthStore()

const { data: dangMuon, isPending: pendingBorrow } = useBorrowingBooks()
const { data: quaHan, isPending: pendingOverdue, error, refetch } = useOverdueBooks()
const { data: books, isPending: pendingBooks } = useBooks()

const hetTon = computed(() => (books.value ?? []).filter((b) => b.SoLuongTon <= 0).length)

/** Quá hạn lâu nhất xếp trước — đây là việc thủ thư cần xử lý ngay */
const quaHanNang = computed(() =>
  [...(quaHan.value ?? [])].sort((a, b) => b.SoNgayQuaHan - a.SoNgayQuaHan).slice(0, 8),
)
</script>

<template>
  <div>
    <CommonPageHeader
      title="Tổng quan"
      :description="`Xin chào ${auth.user?.HoTen}, đây là tình hình thư viện hôm nay`"
    />

    <div class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <CommonStatCard
        label="Sách đang được mượn"
        :value="dangMuon?.length ?? 0"
        :icon="BookMarked"
        tone="success"
        :loading="pendingBorrow"
      />
      <CommonStatCard
        label="Sách quá hạn"
        :value="quaHan?.length ?? 0"
        :icon="AlertTriangle"
        tone="danger"
        :loading="pendingOverdue"
        hint="Cần liên hệ sinh viên thu hồi"
      />
      <CommonStatCard
        label="Đầu sách trong kho"
        :value="books?.length ?? 0"
        :icon="BookOpen"
        :loading="pendingBooks"
      />
      <CommonStatCard
        label="Đầu sách đã hết"
        :value="hetTon"
        :icon="PackageX"
        tone="warning"
        :loading="pendingBooks"
        hint="Không còn bản nào để cho mượn"
      />
    </div>

    <UiCard class="overflow-hidden">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
        <div>
          <h2 class="font-semibold">Quá hạn cần xử lý</h2>
          <p class="mt-0.5 text-sm text-muted-foreground">Xếp theo số ngày trễ giảm dần</p>
        </div>
        <UiButton variant="outline" size="sm" @click="navigateTo('/admin/reports')">
          Xem tất cả
        </UiButton>
      </div>

      <div class="p-5">
        <CommonQueryState
          :pending="pendingOverdue"
          :error="error"
          :empty="!quaHanNang.length"
          empty-title="Không có sách nào quá hạn"
          empty-description="Toàn bộ sách đang mượn đều còn trong thời hạn."
          @retry="refetch()"
        >
          <UiTable>
            <thead>
              <tr>
                <th>Sinh viên</th>
                <th>Sách</th>
                <th>Hẹn trả</th>
                <th class="text-right">Số ngày trễ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in quaHanNang" :key="row.MaCTPM">
                <td>
                  <p class="font-medium">{{ row.TenSinhVien }}</p>
                  <p class="font-mono text-xs text-muted-foreground">{{ row.MaSV }}</p>
                </td>
                <td class="max-w-64 truncate">{{ row.TenSach }}</td>
                <td class="tabular-nums">{{ formatDate(row.NgayHenTra) }}</td>
                <td class="text-right">
                  <UiBadge variant="danger">{{ row.SoNgayQuaHan }} ngày</UiBadge>
                </td>
              </tr>
            </tbody>
          </UiTable>
        </CommonQueryState>
      </div>
    </UiCard>
  </div>
</template>
