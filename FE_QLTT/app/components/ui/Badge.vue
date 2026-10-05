<script setup lang="ts">
import type { VariantProps } from 'class-variance-authority'
import { badgeVariants } from '~/lib/variants'
import { cn } from '~/lib/utils'

type BadgeVariants = VariantProps<typeof badgeVariants>

const props = defineProps<{
  variant?: BadgeVariants['variant']
  class?: string
}>()
</script>

<template>
  <span :class="cn(badgeVariants({ variant: props.variant }), props.class)">
    <slot />
  </span>
</template>
