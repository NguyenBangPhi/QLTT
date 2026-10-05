<script setup lang="ts">
import { Bell } from 'lucide-vue-next'
import { clientNav } from '~/lib/nav'

const unread = useUnreadCount()
</script>

<template>
  <AppShell :nav="clientNav" area="Sinh viên">
    <template #topbar-end>
      <NuxtLink
        to="/notifications"
        class="relative grid size-9 place-items-center rounded-md hover:bg-accent hover:text-accent-foreground"
        :aria-label="unread > 0 ? `Thông báo, ${unread} chưa đọc` : 'Thông báo'"
      >
        <Bell class="size-4" aria-hidden="true" />
        <span
          v-if="unread > 0"
          class="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground tabular-nums"
        >{{ unread > 9 ? '9+' : unread }}</span>
      </NuxtLink>
    </template>

    <slot />
  </AppShell>
</template>
