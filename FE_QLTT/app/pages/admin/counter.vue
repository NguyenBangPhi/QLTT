<script setup lang="ts">
import { TabsContent, TabsIndicator, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'

definePageMeta({ layout: 'admin', roles: ['Admin', 'Thủ thư'] })
useHead({ title: 'Quầy mượn trả · Quản trị thư viện' })

const tabs = [
  { value: 'borrow', label: 'Lập phiếu mượn' },
  { value: 'return', label: 'Xác nhận trả' },
  { value: 'fine', label: 'Điều chỉnh phạt' },
]

const tab = useTabQuery(tabs.map((t) => t.value))
</script>

<template>
  <div>
    <CommonPageHeader
      title="Quầy mượn trả"
      description="Lập phiếu mượn, ghi nhận trả sách và điều chỉnh tiền phạt"
    />

    <TabsRoot v-model="tab">
      <TabsList
        class="relative mb-6 inline-flex gap-1 rounded-lg border bg-muted/50 p-1"
        aria-label="Chức năng quầy mượn trả"
      >
        <TabsIndicator
          class="absolute top-1 left-0 h-[calc(100%-0.5rem)] w-[var(--reka-tabs-indicator-size)] translate-x-[var(--reka-tabs-indicator-position)] rounded-md bg-card shadow-sm transition-[width,transform] duration-200"
        />
        <TabsTrigger
          v-for="t in tabs"
          :key="t.value"
          :value="t.value"
          class="relative z-10 rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:text-foreground"
        >
          {{ t.label }}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="borrow" class="focus:outline-none">
        <CounterBorrowForm />
      </TabsContent>

      <TabsContent value="return" class="focus:outline-none">
        <CounterReturnTable />
      </TabsContent>

      <TabsContent value="fine" class="focus:outline-none">
        <CounterFineTable />
      </TabsContent>
    </TabsRoot>
  </div>
</template>
