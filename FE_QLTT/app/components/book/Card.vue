<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next'
import type { Book } from '~/types/api'

defineProps<{ book: Book }>()
</script>

<template>
  <NuxtLink
    :to="`/books/${book.MaSach}`"
    class="group block rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2"
  >
    <div class="flex gap-3">
      <div
        class="grid size-12 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground"
        aria-hidden="true"
      >
        <BookOpen class="size-5" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="line-clamp-2 font-medium leading-snug group-hover:text-primary">
          {{ book.TenSach }}
        </p>
        <p class="mt-0.5 truncate text-sm text-muted-foreground">{{ book.TenTacGia }}</p>
      </div>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <UiBadge variant="outline">{{ book.TenTheLoai }}</UiBadge>
      <BookStockBadge :ton="book.SoLuongTon" :tong="book.SoLuongTong" />
    </div>

    <p class="mt-2 truncate font-mono text-xs text-muted-foreground">ISBN {{ book.ISBN }}</p>
  </NuxtLink>
</template>
