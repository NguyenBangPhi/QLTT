<script setup lang="ts">
const props = defineProps<{ total: number | undefined; limit: number }>()
const page = defineModel<number>('page', { required: true })

const totalPages = computed(() => Math.max(1, Math.ceil((props.total ?? 0) / props.limit)))

const items = computed<(number | 'gap')[]>(() => {
  const last = totalPages.value
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)

  const out: (number | 'gap')[] = [1]
  const start = Math.max(2, page.value - 1)
  const end = Math.min(last - 1, page.value + 1)

  if (start > 2) out.push('gap')
  for (let i = start; i <= end; i++) out.push(i)
  if (end < last - 1) out.push('gap')
  out.push(last)

  return out
})
</script>

<template>
  <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
    <p class="text-sm text-muted-foreground">
      Trang {{ page }}/{{ totalPages }} · tổng {{ props.total ?? 0 }} bản ghi
    </p>

    <nav class="flex flex-wrap items-center gap-1" aria-label="Phân trang">
      <UiButton variant="outline" size="sm" :disabled="page <= 1" @click="page--">Trước</UiButton>

      <template v-for="(item, i) in items" :key="i">
        <span v-if="item === 'gap'" class="px-1 text-sm text-muted-foreground">…</span>
        <UiButton
          v-else
          :variant="item === page ? 'default' : 'outline'"
          size="sm"
          class="w-8 px-0"
          :aria-label="`Trang ${item}`"
          :aria-current="item === page ? 'page' : undefined"
          @click="page = item"
        >
          {{ item }}
        </UiButton>
      </template>

      <UiButton variant="outline" size="sm" :disabled="page >= totalPages" @click="page++">
        Sau
      </UiButton>
    </nav>
  </div>
</template>
