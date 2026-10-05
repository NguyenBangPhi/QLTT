<script setup lang="ts">
definePageMeta({ layout: 'admin', roles: ['Admin', 'Thủ thư'] })
useHead({ title: 'Thể loại · Quản trị thư viện' })
</script>

<template>
  <CatalogCrudSection resource="genres" />
</template>
