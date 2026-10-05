<script setup lang="ts">
import { cn } from '~/lib/utils'

const props = defineProps<{ class?: string }>()
</script>

<template>
  <div class="overflow-x-auto rounded-lg border">
    <!-- Kiểu dáng ô nằm trong .data-table ở main.css để các trang không phải lặp class -->
    <table :class="cn('data-table w-full caption-bottom text-sm', props.class)">
      <slot />
    </table>
  </div>
</template>
