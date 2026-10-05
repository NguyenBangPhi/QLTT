<script setup lang="ts">
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import { formatDateTime } from '~/lib/format'

definePageMeta({ layout: 'admin', roles: ['Admin'] })
useHead({ title: 'Nhật ký hệ thống · Quản trị thư viện' })

const LIMIT = 20
const page = ref(1)
const { data, isPending, error, refetch } = useLogs(page, LIMIT)

const totalPages = computed(() => Math.max(1, Math.ceil((data.value?.total ?? 0) / LIMIT)))

const expanded = ref<number | null>(null)
function toggle(id: number) {
  expanded.value = expanded.value === id ? null : id
}

/** Gộp khoá của giá trị cũ và mới để hiện đủ cả trường bị xoá lẫn trường mới thêm */
function diffKeys(cu: Record<string, unknown> | null, moi: Record<string, unknown> | null) {
  return [...new Set([...Object.keys(cu ?? {}), ...Object.keys(moi ?? {})])]
}

function show(value: unknown) {
  if (value === undefined || value === null) return '—'
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
}
</script>

<template>
  <div>
    <CommonPageHeader
      title="Nhật ký hệ thống"
      description="Lịch sử các thao tác sửa và xoá sách, hệ thống tự động ghi lại"
    />

    <CommonQueryState
      :pending="isPending"
      :error="error"
      :empty="!data?.data.length"
      empty-title="Chưa có bản ghi nào"
      empty-description="Nhật ký sẽ tự sinh khi có thao tác sửa hoặc xoá sách."
      @retry="refetch()"
    >
      <UiTable>
        <thead>
          <tr>
            <th class="w-10" />
            <th>Thời gian</th>
            <th>Bảng</th>
            <th>Hành động</th>
            <th>Bản ghi</th>
            <th>Người thực hiện</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="log in data?.data" :key="log.MaLog">
            <tr class="cursor-pointer hover:bg-muted/40" @click="toggle(log.MaLog)">
              <td>
                <component
                  :is="expanded === log.MaLog ? ChevronDown : ChevronRight"
                  class="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </td>
              <td class="tabular-nums whitespace-nowrap">{{ formatDateTime(log.ThoiGian) }}</td>
              <td class="font-mono text-xs">{{ log.TenBang }}</td>
              <td>
                <UiBadge :variant="log.HanhDong === 1 ? 'danger' : 'warning'">
                  {{ log.HanhDong === 1 ? 'DELETE' : 'UPDATE' }}
                </UiBadge>
              </td>
              <td class="font-mono text-xs">#{{ log.MaBanGhi }}</td>
              <td>{{ log.NguoiThucHien || '—' }}</td>
            </tr>

            <tr v-if="expanded === log.MaLog" class="bg-muted/30">
              <td colspan="6" class="px-4 py-4">
                <div class="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p class="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Giá trị cũ
                    </p>
                    <dl class="space-y-1.5 rounded-lg border border-danger-soft bg-danger-soft/30 p-3 text-sm">
                      <div
                        v-for="key in diffKeys(log.GiaTriCu, log.GiaTriMoi)"
                        :key="key"
                        class="flex justify-between gap-3"
                      >
                        <dt class="font-mono text-xs text-muted-foreground">{{ key }}</dt>
                        <dd class="text-right break-all">{{ show(log.GiaTriCu?.[key]) }}</dd>
                      </div>
                      <p v-if="!log.GiaTriCu" class="text-muted-foreground">Không có</p>
                    </dl>
                  </div>

                  <div>
                    <p class="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Giá trị mới
                    </p>
                    <dl class="space-y-1.5 rounded-lg border border-success-soft bg-success-soft/30 p-3 text-sm">
                      <div
                        v-for="key in diffKeys(log.GiaTriCu, log.GiaTriMoi)"
                        :key="key"
                        class="flex justify-between gap-3"
                      >
                        <dt class="font-mono text-xs text-muted-foreground">{{ key }}</dt>
                        <dd class="text-right break-all">{{ show(log.GiaTriMoi?.[key]) }}</dd>
                      </div>
                      <p v-if="!log.GiaTriMoi" class="text-muted-foreground">
                        Bản ghi đã bị xoá
                      </p>
                    </dl>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </UiTable>

      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-muted-foreground">
          Trang {{ page }}/{{ totalPages }} · tổng {{ data?.total }} bản ghi
        </p>
        <div class="flex gap-2">
          <UiButton variant="outline" size="sm" :disabled="page <= 1" @click="page--">Trước</UiButton>
          <UiButton variant="outline" size="sm" :disabled="page >= totalPages" @click="page++">
            Sau
          </UiButton>
        </div>
      </div>
    </CommonQueryState>
  </div>
</template>
