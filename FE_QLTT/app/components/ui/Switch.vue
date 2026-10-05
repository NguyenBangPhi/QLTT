<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui'

defineProps<{ disabled?: boolean; label: string }>()
const model = defineModel<boolean>({ required: true })
</script>

<template>
  <SwitchRoot
    v-model="model"
    :disabled="disabled"
    :aria-label="label"
    class="peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-success data-[state=unchecked]:bg-input"
  >
    <SwitchThumb
      class="block size-4 rounded-full bg-background shadow transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
    />
  </SwitchRoot>
</template>
