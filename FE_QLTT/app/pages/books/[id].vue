<script setup lang="ts">
import { ArrowLeft, BookOpen, Building2, Calendar, Hash, User } from 'lucide-vue-next'

definePageMeta({ layout: 'client', roles: ['Sinh viên'] })

const route = useRoute()
const id = computed(() => Number(route.params.id))
const { data: book, isPending, error, refetch } = useBook(id)

watchEffect(() => {
  useHead({ title: book.value ? `${book.value.TenSach} · Thư viện` : 'Chi tiết sách' })
})

const soDangMuon = computed(() =>
  book.value ? book.value.SoLuongTong - book.value.SoLuongTon : 0,
)
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <UiButton variant="ghost" size="sm" class="mb-4 -ml-2" @click="navigateTo('/')">
      <ArrowLeft aria-hidden="true" />
      Quay lại tra cứu
    </UiButton>

    <CommonQueryState :pending="isPending" :error="error" :skeleton-rows="3" @retry="refetch()">
      <UiCard v-if="book" class="overflow-hidden">
        <div class="flex flex-wrap items-start gap-4 border-b bg-accent/30 p-6">
          <div
            class="grid size-16 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"
            aria-hidden="true"
          >
            <BookOpen class="size-7" />
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="text-xl font-semibold leading-snug">{{ book.TenSach }}</h1>
            <p class="mt-1 text-muted-foreground">{{ book.TenTacGia }}</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <UiBadge variant="outline">{{ book.TenTheLoai }}</UiBadge>
              <BookStockBadge :ton="book.SoLuongTon" :tong="book.SoLuongTong" />
            </div>
          </div>
        </div>

        <dl class="grid gap-x-8 gap-y-5 p-6 sm:grid-cols-2">
          <div class="flex gap-3">
            <Hash class="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <dt class="text-xs text-muted-foreground">Mã ISBN</dt>
              <dd class="font-mono text-sm">{{ book.ISBN }}</dd>
            </div>
          </div>

          <div class="flex gap-3">
            <User class="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <dt class="text-xs text-muted-foreground">Tác giả</dt>
              <dd class="text-sm">{{ book.TenTacGia }}</dd>
            </div>
          </div>

          <div class="flex gap-3">
            <Building2 class="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <dt class="text-xs text-muted-foreground">Nhà xuất bản</dt>
              <dd class="text-sm">{{ book.NhaXuatBan || '—' }}</dd>
            </div>
          </div>

          <div class="flex gap-3">
            <Calendar class="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <dt class="text-xs text-muted-foreground">Năm xuất bản</dt>
              <dd class="text-sm">{{ book.NamXuatBan || '—' }}</dd>
            </div>
          </div>
        </dl>

        <div class="grid grid-cols-3 divide-x border-t text-center">
          <div class="p-4">
            <p class="text-2xl font-semibold tabular-nums">{{ book.SoLuongTong }}</p>
            <p class="mt-0.5 text-xs text-muted-foreground">Tổng số bản</p>
          </div>
          <div class="p-4">
            <p class="text-2xl font-semibold tabular-nums text-success">{{ book.SoLuongTon }}</p>
            <p class="mt-0.5 text-xs text-muted-foreground">Còn trong kho</p>
          </div>
          <div class="p-4">
            <p class="text-2xl font-semibold tabular-nums">{{ soDangMuon }}</p>
            <p class="mt-0.5 text-xs text-muted-foreground">Đang được mượn</p>
          </div>
        </div>
      </UiCard>
    </CommonQueryState>
  </div>
</template>
