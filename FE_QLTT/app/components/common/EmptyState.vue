<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    title: string
    description?: string
    icon?: Component
  }>(),
  { icon: () => Inbox },
)
</script>

<template>
  <div class="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-14 text-center">
    <div class="mb-3 grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
      <component :is="icon" class="size-5" aria-hidden="true" />
    </div>
    <p class="font-medium">{{ title }}</p>
    <p v-if="description" class="mt-1 max-w-sm text-sm text-muted-foreground">{{ description }}</p>
    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>
