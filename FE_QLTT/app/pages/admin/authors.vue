<script setup lang="ts">
definePageMeta({ layout: 'admin', roles: ['Admin', 'Thủ thư'] })
useHead({ title: 'Tác giả · Quản trị thư viện' })
</script>

<template>
  <CatalogCrudSection resource="authors" />
</template>
