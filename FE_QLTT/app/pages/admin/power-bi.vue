<script setup lang="ts">
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { Info } from 'lucide-vue-next'
import { POWER_BI_HEIGHT, POWER_BI_WIDTH, powerBiReports } from '~/lib/power-bi'

definePageMeta({ layout: 'admin', roles: ['Admin', 'Thủ thư'] })
useHead({ title: 'Báo cáo Power BI · Quản trị thư viện' })

const tab = useTabQuery(powerBiReports.map((r) => r.key))
</script>

<template>
  <div>
    <CommonPageHeader
      title="Báo cáo Power BI"
      description="Ba báo cáo phân tích được nhúng trực tiếp từ Power BI"
    />

    <TabsRoot v-model="tab">
      <TabsList
        class="mb-4 inline-flex flex-wrap gap-1 rounded-lg border bg-muted/50 p-1"
        aria-label="Chọn báo cáo"
      >
        <TabsTrigger
          v-for="report in powerBiReports"
          :key="report.key"
          :value="report.key"
          class="rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
        >
          {{ report.label }}
        </TabsTrigger>
      </TabsList>

      <TabsContent
        v-for="report in powerBiReports"
        :key="report.key"
        :value="report.key"
        class="focus:outline-none"
      >
        <div class="overflow-hidden rounded-xl border bg-card">
          <iframe
            :title="report.title"
            :src="report.src"
            :style="{ aspectRatio: `${POWER_BI_WIDTH} / ${POWER_BI_HEIGHT}` }"
            class="block min-h-[541px] w-full border-0"
            allowfullscreen
          />
        </div>
      </TabsContent>
    </TabsRoot>

    <p class="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
      <Info class="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span>
        Khung trống nghĩa là chưa đăng nhập tài khoản Microsoft thuộc tổ chức sở hữu báo cáo. Mở
        <a
          href="https://app.powerbi.com"
          target="_blank"
          rel="noopener noreferrer"
          class="underline underline-offset-4 hover:text-foreground"
        >app.powerbi.com</a>
        ở tab khác, đăng nhập rồi tải lại trang này.
      </span>
    </p>
  </div>
</template>
