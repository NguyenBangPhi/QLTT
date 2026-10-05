<script setup lang="ts">
import { AlertTriangle, RotateCw } from 'lucide-vue-next'
import { normalizeApiError } from '~/lib/api-error'

const props = withDefaults(
  defineProps<{
    pending: boolean
    error?: unknown
    empty?: boolean
    emptyTitle?: string
    emptyDescription?: string
    skeletonRows?: number
  }>(),
  { emptyTitle: 'Chưa có dữ liệu', skeletonRows: 4 },
)

const emit = defineEmits<{ retry: [] }>()

const message = computed(() => (props.error ? normalizeApiError(props.error).message : ''))
</script>

<template>
  <div v-if="pending" class="space-y-2" aria-busy="true" aria-live="polite">
    <slot name="skeleton">
      <UiSkeleton v-for="i in skeletonRows" :key="i" class="h-14 w-full" />
    </slot>
  </div>

  <div
    v-else-if="error"
    class="flex flex-col items-center rounded-lg border border-danger-soft bg-danger-soft/40 px-6 py-10 text-center"
    role="alert"
  >
    <AlertTriangle class="mb-2 size-6 text-danger-soft-foreground" aria-hidden="true" />
    <p class="font-medium text-danger-soft-foreground">Không tải được dữ liệu</p>
    <p class="mt-1 max-w-md text-sm text-danger-soft-foreground/80">{{ message }}</p>
    <UiButton variant="outline" size="sm" class="mt-4" @click="emit('retry')">
      <RotateCw aria-hidden="true" />
      Thử lại
    </UiButton>
  </div>

  <CommonEmptyState v-else-if="empty" :title="emptyTitle" :description="emptyDescription">
    <slot name="empty-action" />
  </CommonEmptyState>

  <slot v-else />
</template>
