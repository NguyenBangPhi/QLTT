<script setup lang="ts">
import { AlertTriangle, CheckCircle2, Library, Lock, Mail, School } from 'lucide-vue-next'
import { formatDate, daysUntil } from '~/lib/format'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'client', roles: ['Sinh viên'] })
useHead({ title: 'Thẻ thư viện · Thư viện Đại học' })

const auth = useAuthStore()
const user = computed(() => auth.user)

const theHoatDong = computed(() => user.value?.TrangThaiThe === 1)

const soNgayConLai = computed(() =>
  user.value?.NgayHetHanThe ? daysUntil(user.value.NgayHetHanThe) : null,
)
const sapHetHan = computed(
  () => soNgayConLai.value !== null && soNgayConLai.value >= 0 && soNgayConLai.value <= 30,
)
const daHetHan = computed(() => soNgayConLai.value !== null && soNgayConLai.value < 0)
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <CommonPageHeader
      title="Thẻ thư viện"
      description="Thông tin thẻ và tình trạng sử dụng của bạn"
    />

    <!-- Thẻ thư viện -->
    <div class="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground shadow-lg">
      <div
        class="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-white/10"
        aria-hidden="true"
      />
      <div class="relative flex items-start justify-between gap-4">
        <div class="flex items-center gap-2.5">
          <Library class="size-5" aria-hidden="true" />
          <span class="text-sm font-medium tracking-wide">THƯ VIỆN ĐẠI HỌC</span>
        </div>
        <span
          class="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium"
        >
          <component
            :is="theHoatDong ? CheckCircle2 : Lock"
            class="size-3.5"
            aria-hidden="true"
          />
          {{ theHoatDong ? 'Đang hoạt động' : 'Đã khoá' }}
        </span>
      </div>

      <p class="relative mt-8 font-mono text-2xl tracking-[0.2em]">{{ user?.MaSV }}</p>
      <p class="relative mt-1 text-lg font-semibold">{{ user?.HoTen }}</p>

      <div class="relative mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-primary-foreground/70">Ngày cấp</p>
          <p class="font-medium tabular-nums">{{ formatDate(user?.NgayCapThe) }}</p>
        </div>
        <div>
          <p class="text-primary-foreground/70">Ngày hết hạn</p>
          <p class="font-medium tabular-nums">{{ formatDate(user?.NgayHetHanThe) }}</p>
        </div>
      </div>
    </div>

    <!-- Cảnh báo -->
    <div
      v-if="!theHoatDong"
      class="mt-4 flex gap-3 rounded-lg border border-danger-soft bg-danger-soft/50 p-4 text-danger-soft-foreground"
      role="alert"
    >
      <Lock class="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div class="text-sm">
        <p class="font-medium">Thẻ của bạn đang bị khoá</p>
        <p class="mt-0.5">
          Bạn sẽ không mượn được sách cho tới khi thẻ được mở lại. Vui lòng trả hết sách quá hạn
          rồi liên hệ thủ thư.
        </p>
      </div>
    </div>

    <div
      v-else-if="daHetHan"
      class="mt-4 flex gap-3 rounded-lg border border-danger-soft bg-danger-soft/50 p-4 text-danger-soft-foreground"
      role="alert"
    >
      <AlertTriangle class="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div class="text-sm">
        <p class="font-medium">Thẻ đã hết hạn</p>
        <p class="mt-0.5">Liên hệ thủ thư để được cấp lại thẻ.</p>
      </div>
    </div>

    <div
      v-else-if="sapHetHan"
      class="mt-4 flex gap-3 rounded-lg border border-warning-soft bg-warning-soft/50 p-4 text-warning-soft-foreground"
      role="status"
    >
      <AlertTriangle class="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div class="text-sm">
        <p class="font-medium">Thẻ sắp hết hạn</p>
        <p class="mt-0.5">Còn {{ soNgayConLai }} ngày nữa là tới hạn gia hạn thẻ.</p>
      </div>
    </div>

    <!-- Thông tin sinh viên -->
    <UiCard class="mt-6 p-6">
      <h2 class="mb-4 font-semibold">Thông tin sinh viên</h2>
      <dl class="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        <div class="flex gap-3">
          <School class="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div>
            <dt class="text-xs text-muted-foreground">Lớp</dt>
            <dd class="text-sm">{{ user?.Lop || '—' }}</dd>
          </div>
        </div>
        <div class="flex gap-3">
          <School class="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div>
            <dt class="text-xs text-muted-foreground">Khoa</dt>
            <dd class="text-sm">{{ user?.Khoa || '—' }}</dd>
          </div>
        </div>
        <div class="flex gap-3 sm:col-span-2">
          <Mail class="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div class="min-w-0">
            <dt class="text-xs text-muted-foreground">Email</dt>
            <dd class="truncate text-sm">{{ user?.Email || '—' }}</dd>
          </div>
        </div>
      </dl>
    </UiCard>
  </div>
</template>
