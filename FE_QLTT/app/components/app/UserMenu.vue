<script setup lang="ts">
import { ChevronDown, LogOut, IdCard, LayoutDashboard } from 'lucide-vue-next'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'reka-ui'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()

const initials = computed(() => {
  const name = auth.user?.HoTen?.trim()
  if (!name) return '?'
  const parts = name.split(/\s+/)
  return (parts[parts.length - 1]?.[0] ?? '?').toUpperCase()
})
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger
      class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
      :aria-label="`Tài khoản ${auth.user?.HoTen}`"
    >
      <span
        class="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
        aria-hidden="true"
      >{{ initials }}</span>
      <span class="hidden text-left sm:block">
        <span class="block max-w-36 truncate font-medium leading-tight">{{ auth.user?.HoTen }}</span>
        <span class="block text-xs leading-tight text-muted-foreground">{{ auth.role }}</span>
      </span>
      <ChevronDown class="size-4 text-muted-foreground" aria-hidden="true" />
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent
        :side-offset="6"
        align="end"
        class="z-50 min-w-56 rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg"
      >
        <div class="px-2 py-1.5">
          <p class="truncate text-sm font-medium">{{ auth.user?.HoTen }}</p>
          <p class="truncate text-xs text-muted-foreground">{{ auth.user?.Email }}</p>
        </div>

        <DropdownMenuSeparator class="my-1 h-px bg-border" />

        <DropdownMenuItem
          v-if="auth.isStudent"
          class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
          @select="navigateTo('/profile')"
        >
          <IdCard class="size-4" aria-hidden="true" />
          Thẻ thư viện
        </DropdownMenuItem>

        <DropdownMenuItem
          v-if="auth.isStaff"
          class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
          @select="navigateTo('/admin')"
        >
          <LayoutDashboard class="size-4" aria-hidden="true" />
          Trang quản trị
        </DropdownMenuItem>

        <DropdownMenuSeparator class="my-1 h-px bg-border" />

        <DropdownMenuItem
          class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive outline-none data-[highlighted]:bg-danger-soft data-[highlighted]:text-danger-soft-foreground"
          @select="auth.logout()"
        >
          <LogOut class="size-4" aria-hidden="true" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
