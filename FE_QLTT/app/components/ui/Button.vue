<script setup lang="ts">
import type { VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-vue-next'
import { buttonVariants } from '~/lib/variants'
import { cn } from '~/lib/utils'

type ButtonVariants = VariantProps<typeof buttonVariants>

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariants['variant']
    size?: ButtonVariants['size']
    type?: 'button' | 'submit' | 'reset'
    loading?: boolean
    disabled?: boolean
    class?: string
  }>(),
  { type: 'button' },
)
</script>

<template>
  <button
    :type="props.type"
    :disabled="props.disabled || props.loading"
    :aria-busy="props.loading || undefined"
    :class="cn(buttonVariants({ variant: props.variant, size: props.size }), props.class)"
  >
    <Loader2 v-if="props.loading" class="animate-spin" aria-hidden="true" />
    <slot />
  </button>
</template>
