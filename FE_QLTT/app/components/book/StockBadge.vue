<script setup lang="ts">
const props = defineProps<{ ton: number; tong?: number }>()

const variant = computed(() => {
  if (props.ton <= 0) return 'danger'
  if (props.ton <= 2) return 'warning'
  return 'success'
})

const label = computed(() => {
  if (props.ton <= 0) return 'Hết sách'
  return props.tong === undefined ? `Còn ${props.ton}` : `Còn ${props.ton}/${props.tong}`
})
</script>

<template>
  <UiBadge :variant="variant">{{ label }}</UiBadge>
</template>
