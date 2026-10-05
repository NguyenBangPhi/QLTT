<script setup lang="ts">
import { cn } from '~/lib/utils'

const props = defineProps<{ accept: string; disabled?: boolean; class?: string }>()
const model = defineModel<File | null>({ required: true })

const inputRef = ref<HTMLInputElement | null>(null)

function onChange(event: Event) {
  const files = (event.target as HTMLInputElement).files
  model.value = files && files.length > 0 ? files[0]! : null
}

function clear() {
  model.value = null
  if (inputRef.value) inputRef.value.value = ''
}
</script>

<template>
  <div :class="cn('flex flex-wrap items-center gap-2', props.class)">
    <input
      ref="inputRef"
      type="file"
      :accept="props.accept"
      :disabled="props.disabled"
      :class="
        cn(
          'h-9 min-w-0 flex-1 rounded-md border border-input bg-background text-sm shadow-sm',
          'file:mr-3 file:h-full file:cursor-pointer file:border-0 file:bg-secondary file:px-3',
          'file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
        )
      "
      @change="onChange"
    >
    <UiButton v-if="model" variant="ghost" size="sm" :disabled="props.disabled" @click="clear">
      Bỏ chọn
    </UiButton>
  </div>
</template>
