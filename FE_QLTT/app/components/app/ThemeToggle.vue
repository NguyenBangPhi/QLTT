<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'

const isDark = useDark({ storageKey: 'qltt.theme' })
const toggle = useToggle(isDark)
</script>

<template>
  <UiButton
    variant="ghost"
    size="icon"
    :aria-label="isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'"
    @click="toggle()"
  >
    <Moon v-if="isDark" aria-hidden="true" />
    <Sun v-else aria-hidden="true" />
  </UiButton>
</template>
