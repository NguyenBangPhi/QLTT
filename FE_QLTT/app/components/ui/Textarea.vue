<script setup lang="ts">
import { cn } from '~/lib/utils'

const props = defineProps<{ class?: string }>()
const model = defineModel<string | null>()
</script>

<template>
  <textarea
    v-model="model"
    :class="
      cn(
        'flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm',
        'placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
        props.class,
      )
    "
  />
</template>
