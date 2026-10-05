<script setup lang="ts">
import { ShieldOff } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Không đủ quyền' })

const auth = useAuthStore()
</script>

<template>
  <UiCard class="p-8 text-center">
    <div class="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-danger-soft text-danger-soft-foreground">
      <ShieldOff class="size-6" aria-hidden="true" />
    </div>
    <h1 class="text-lg font-semibold">Không đủ quyền truy cập</h1>
    <p class="mt-2 text-sm text-muted-foreground">
      Tài khoản
      <span class="font-medium text-foreground">{{ auth.user?.HoTen }}</span>
      ({{ auth.role }}) không được phép mở trang này.
    </p>
    <UiButton class="mt-6 w-full" @click="navigateTo(auth.homePath)">Về trang chủ</UiButton>
  </UiCard>
</template>
