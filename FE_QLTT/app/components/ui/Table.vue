<script setup lang="ts">
import { cn } from '~/lib/utils'

const props = defineProps<{ class?: string }>()
</script>

<template>
  <div class="overflow-x-auto rounded-lg border">
    <table :class="cn('data-table w-full caption-bottom text-sm', props.class)">
      <slot />
    </table>
  </div>
</template>
