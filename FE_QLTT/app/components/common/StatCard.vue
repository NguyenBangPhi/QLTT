<script setup lang="ts">
import type { Component } from 'vue'
import { cn } from '~/lib/utils'

const props = withDefaults(
  defineProps<{
    label: string
    value: number | string
    hint?: string
    icon?: Component
    tone?: 'default' | 'success' | 'warning' | 'danger'
    loading?: boolean
  }>(),
  { tone: 'default' },
)

const toneClass = computed(
  () =>
    ({
      default: 'bg-accent text-accent-foreground',
      success: 'bg-success-soft text-success-soft-foreground',
      warning: 'bg-warning-soft text-warning-soft-foreground',
      danger: 'bg-danger-soft text-danger-soft-foreground',
    })[props.tone],
)
</script>

<template>
  <UiCard class="p-5">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="truncate text-sm text-muted-foreground">{{ label }}</p>
        <UiSkeleton v-if="loading" class="mt-2 h-8 w-16" />
        <p v-else class="mt-1 text-3xl font-semibold tabular-nums">{{ value }}</p>
        <p v-if="hint" class="mt-1 truncate text-xs text-muted-foreground">{{ hint }}</p>
      </div>
      <div v-if="icon" :class="cn('grid size-10 shrink-0 place-items-center rounded-lg', toneClass)">
        <component :is="icon" class="size-5" aria-hidden="true" />
      </div>
    </div>
  </UiCard>
</template>
