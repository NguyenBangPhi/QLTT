<script setup lang="ts">
import { BellRing, Check, Lock, RotateCw } from 'lucide-vue-next'

definePageMeta({ layout: 'admin', roles: ['Admin'] })
useHead({ title: 'Tham số hệ thống · Quản trị thư viện' })

const { data: configs, isPending, error, refetch } = useConfigs()
const updateConfig = useUpdateConfig()
const { lockOverdue, sendReminders } = useSystemTasks()

type FieldKind = 'integer' | 'time' | 'email'

/** Mỗi tham số có kiểu riêng nên cần luật kiểm tra riêng trước khi gửi lên */
const FIELD_KIND: Record<string, FieldKind> = {
  SO_SACH_TOI_DA: 'integer',
  TIEN_PHAT_MOT_NGAY: 'integer',
  NGUONG_KHOA_THE: 'integer',
  SO_NGAY_NHAC_TRUOC: 'integer',
  SO_NGAY_MUON_TOI_DA: 'integer',
  PHI_LAM_THE_MOI: 'integer',
  GIO_MO_CUA: 'time',
  GIO_DONG_CUA: 'time',
  EMAIL_LIEN_HE: 'email',
}

function kindOf(key: string): FieldKind {
  return FIELD_KIND[key] ?? 'integer'
}

/**
 * Ô <input type="number"> trả về kiểu số vì Vue tự ép kiểu, còn ô text trả về chuỗi.
 * Chuẩn hoá về chuỗi trước khi kiểm tra, nếu không sẽ gọi .trim() trên số và văng lỗi.
 */
function asText(value: string | number | undefined | null): string {
  return value === undefined || value === null ? '' : String(value)
}

function validate(key: string, value: string | number | undefined | null): string {
  const trimmed = asText(value).trim()
  if (!trimmed) return 'Không được để trống'

  switch (kindOf(key)) {
    case 'integer':
      if (!/^\d+$/.test(trimmed)) return 'Phải là số nguyên không âm'
      return ''
    case 'time':
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(trimmed)) return 'Định dạng phải là HH:mm'
      return ''
    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Email không hợp lệ'
      return ''
  }
}

/** Giá trị đang chỉnh, tách khỏi dữ liệu gốc để biết dòng nào đã thay đổi */
const draft = reactive<Record<string, string | number>>({})

watchEffect(() => {
  for (const c of configs.value ?? []) {
    if (draft[c.TenCauHinh] === undefined) draft[c.TenCauHinh] = c.GiaTri
  }
})

function isDirty(key: string, original: string) {
  return draft[key] !== undefined && asText(draft[key]) !== original
}

function save(key: string) {
  const value = asText(draft[key]).trim()
  if (validate(key, value)) return
  updateConfig.mutate({ key, value })
}

function reset(key: string, original: string) {
  draft[key] = original
}
</script>

<template>
  <div>
    <CommonPageHeader
      title="Tham số hệ thống"
      description="Các quy định chung của thư viện, thay đổi ở đây áp dụng ngay cho toàn hệ thống"
    />

    <CommonQueryState
      :pending="isPending"
      :error="error"
      :empty="!configs?.length"
      empty-title="Chưa có tham số nào"
      @retry="refetch()"
    >
      <template #skeleton>
        <div class="grid gap-4 lg:grid-cols-2">
          <UiSkeleton v-for="i in 6" :key="i" class="h-32 w-full rounded-xl" />
        </div>
      </template>

      <div class="grid gap-4 lg:grid-cols-2">
        <UiCard v-for="c in configs" :key="c.TenCauHinh" class="flex flex-col gap-3 p-4">
          <div>
            <p class="text-sm font-medium">{{ c.MoTa ?? c.TenCauHinh }}</p>
            <p class="mt-0.5 font-mono text-xs text-muted-foreground">{{ c.TenCauHinh }}</p>
          </div>

          <!-- mt-auto ghim hàng thao tác xuống đáy để các thẻ trong cùng một dòng thẳng nhau -->
          <div class="mt-auto flex items-start gap-2">
            <div class="min-w-0 flex-1">
              <UiInput
                v-model="draft[c.TenCauHinh]"
                :type="kindOf(c.TenCauHinh) === 'integer' ? 'number' : 'text'"
                :aria-label="c.MoTa ?? c.TenCauHinh"
                :aria-invalid="Boolean(validate(c.TenCauHinh, draft[c.TenCauHinh] ?? ''))"
              />
              <p
                v-if="validate(c.TenCauHinh, draft[c.TenCauHinh] ?? '')"
                class="mt-1 text-xs text-destructive"
              >
                {{ validate(c.TenCauHinh, draft[c.TenCauHinh] ?? '') }}
              </p>
            </div>

            <UiButton
              size="sm"
              :disabled="
                !isDirty(c.TenCauHinh, c.GiaTri) ||
                Boolean(validate(c.TenCauHinh, draft[c.TenCauHinh] ?? ''))
              "
              :loading="updateConfig.isPending.value"
              @click="save(c.TenCauHinh)"
            >
              <Check aria-hidden="true" />
              Lưu
            </UiButton>
            <UiButton
              v-if="isDirty(c.TenCauHinh, c.GiaTri)"
              size="sm"
              variant="ghost"
              @click="reset(c.TenCauHinh, c.GiaTri)"
            >
              Huỷ
            </UiButton>
          </div>
        </UiCard>
      </div>
    </CommonQueryState>

    <UiCard class="mt-8 p-5">
      <h2 class="font-semibold">Tác vụ hệ thống</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        Hai tác vụ này chạy tự động theo lịch hằng ngày. Bấm để chạy ngay khi cần.
      </p>

      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="rounded-lg border p-4">
          <div class="flex items-center gap-2 font-medium">
            <Lock class="size-4" aria-hidden="true" />
            Khoá thẻ quá hạn
          </div>
          <p class="mt-1 mb-3 text-sm text-muted-foreground">
            Khoá thẻ của những sinh viên trễ hạn quá số ngày cho phép.
          </p>
          <UiButton
            variant="outline"
            size="sm"
            :loading="lockOverdue.isPending.value"
            @click="lockOverdue.mutate()"
          >
            <RotateCw v-if="!lockOverdue.isPending.value" aria-hidden="true" />
            Chạy ngay
          </UiButton>
        </div>

        <div class="rounded-lg border p-4">
          <div class="flex items-center gap-2 font-medium">
            <BellRing class="size-4" aria-hidden="true" />
            Gửi nhắc trả sách
          </div>
          <p class="mt-1 mb-3 text-sm text-muted-foreground">
            Gửi thông báo tới sinh viên có sách sắp đến hạn trả.
          </p>
          <UiButton
            variant="outline"
            size="sm"
            :loading="sendReminders.isPending.value"
            @click="sendReminders.mutate()"
          >
            <RotateCw v-if="!sendReminders.isPending.value" aria-hidden="true" />
            Chạy ngay
          </UiButton>
        </div>
      </div>
    </UiCard>
  </div>
</template>
