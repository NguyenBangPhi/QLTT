<script setup lang="ts">
import { cn } from '~/lib/utils'

const props = defineProps<{ class?: string }>()
const model = defineModel<string | number | null>()
</script>

<template>
  <input
    v-model="model"
    :class="
      cn(
        'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors',
        'placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
        props.class,
      )
    "
  >
</template>
