<script setup lang="ts">
import { Library, Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-vue-next'
import { useStorage } from '@vueuse/core'
import { cn } from '~/lib/utils'
import { visibleNav, type NavItem } from '~/lib/nav'
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{
  nav: NavItem[]
  area: string
}>()

const auth = useAuthStore()
const route = useRoute()
const mobileOpen = ref(false)

const collapsed = useStorage('qltt.sidebar-collapsed', false)

const items = computed(() => visibleNav(props.nav, auth.role))

function isActive(to: string) {
  if (to === '/' || to === '/admin') return route.path === to
  return route.path === to || route.path.startsWith(`${to}/`)
}

watch(() => route.fullPath, () => (mobileOpen.value = false))
</script>

<template>
  <div class="min-h-screen bg-background">
    <aside
      :class="
        cn(
          'fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:flex',
          collapsed ? 'w-16' : 'w-64',
        )
      "
    >
      <div :class="cn('flex items-center gap-2.5 py-5', collapsed ? 'justify-center px-2' : 'px-5')">
        <div
          class="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"
        >
          <Library class="size-5" aria-hidden="true" />
        </div>
        <div v-if="!collapsed" class="min-w-0">
          <p class="truncate text-sm font-semibold leading-tight">Thư viện Đại học</p>
          <p class="truncate text-xs leading-tight text-muted-foreground">{{ area }}</p>
        </div>
      </div>

      <nav
        :class="cn('flex-1 space-y-1 overflow-y-auto overflow-x-hidden pb-4', collapsed ? 'px-2' : 'px-3')"
        aria-label="Điều hướng chính"
      >
        <NuxtLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          :title="collapsed ? item.label : undefined"
          :aria-current="isActive(item.to) ? 'page' : undefined"
          :class="
            cn(
              'flex items-center rounded-md py-2 text-sm font-medium transition-colors',
              collapsed ? 'justify-center px-0' : 'gap-3 px-3',
              isActive(item.to)
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
            )
          "
        >
          <component :is="item.icon" class="size-4 shrink-0" aria-hidden="true" />
          <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
        </NuxtLink>
      </nav>

    </aside>

    <Teleport to="body">
      <div v-if="mobileOpen" class="fixed inset-0 z-50 lg:hidden">
        <div class="absolute inset-0 bg-black/50" @click="mobileOpen = false" />
        <aside class="absolute inset-y-0 left-0 flex w-72 flex-col bg-sidebar shadow-xl">
          <div class="flex items-center justify-between px-5 py-4">
            <p class="font-semibold">{{ area }}</p>
            <UiButton variant="ghost" size="icon" aria-label="Đóng menu" @click="mobileOpen = false">
              <X aria-hidden="true" />
            </UiButton>
          </div>
          <nav class="flex-1 space-y-1 overflow-y-auto px-3 pb-4" aria-label="Điều hướng chính">
            <NuxtLink
              v-for="item in items"
              :key="item.to"
              :to="item.to"
              :class="
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
                  isActive(item.to)
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/50',
                )
              "
            >
              <component :is="item.icon" class="size-4 shrink-0" aria-hidden="true" />
              {{ item.label }}
            </NuxtLink>
          </nav>
        </aside>
      </div>
    </Teleport>

    <div :class="cn('transition-[padding] duration-200', collapsed ? 'lg:pl-16' : 'lg:pl-64')">
      <header
        class="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur lg:px-8"
      >
        <UiButton
          variant="ghost"
          size="icon"
          class="lg:hidden [&_svg]:size-5"
          aria-label="Mở menu"
          @click="mobileOpen = true"
        >
          <Menu aria-hidden="true" />
        </UiButton>

        <UiButton
          variant="ghost"
          size="icon"
          class="hidden lg:inline-flex [&_svg]:size-5"
          :aria-label="collapsed ? 'Mở rộng menu' : 'Thu gọn menu'"
          :aria-expanded="!collapsed"
          :title="collapsed ? 'Mở rộng menu' : 'Thu gọn menu'"
          @click="collapsed = !collapsed"
        >
          <component :is="collapsed ? PanelLeftOpen : PanelLeftClose" aria-hidden="true" />
        </UiButton>

        <div class="min-w-0 flex-1">
          <slot name="topbar-start" />
        </div>

        <slot name="topbar-end" />
        <AppThemeToggle />
        <AppUserMenu />
      </header>

      <main class="p-4 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
