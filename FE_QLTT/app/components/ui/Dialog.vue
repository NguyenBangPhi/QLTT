<script setup lang="ts">
import { X } from 'lucide-vue-next'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import { cn } from '~/lib/utils'

const props = defineProps<{
  title: string
  description?: string
  class?: string
}>()

const open = defineModel<boolean>('open', { required: true })
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
      <DialogContent
        :class="
          cn(
            'fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border bg-card shadow-xl',
            props.class,
          )
        "
      >
        <div class="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div class="min-w-0">
            <DialogTitle class="font-semibold">{{ title }}</DialogTitle>
            <DialogDescription v-if="description" class="mt-1 text-sm text-muted-foreground">
              {{ description }}
            </DialogDescription>
          </div>
          <DialogClose
            class="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Đóng"
          >
            <X class="size-4" aria-hidden="true" />
          </DialogClose>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <slot />
        </div>

        <div v-if="$slots.footer" class="flex justify-end gap-2 border-t px-5 py-4">
          <slot name="footer" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
