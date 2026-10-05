<script setup lang="ts">
import { adminNav } from '~/lib/nav'
</script>

<template>
  <AppShell :nav="adminNav" area="Quản trị thư viện">
    <slot />
  </AppShell>
</template>
