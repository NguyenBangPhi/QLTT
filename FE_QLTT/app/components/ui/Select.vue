<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

const props = defineProps<{ class?: string }>()
const model = defineModel<string | number | null>()
</script>

<template>
  <div class="relative">
    <select
      v-model="model"
      :class="
        cn(
          'h-9 w-full appearance-none rounded-md border border-input bg-background py-1 pr-8 pl-3 text-sm shadow-sm',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
          props.class,
        )
      "
    >
      <slot />
    </select>
    <ChevronDown
      class="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      aria-hidden="true"
    />
  </div>
</template>
