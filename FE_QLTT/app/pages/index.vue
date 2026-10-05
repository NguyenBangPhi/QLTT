<script setup lang="ts">
import { Search, SearchX } from 'lucide-vue-next'

definePageMeta({ layout: 'client', roles: ['Sinh viên'] })
useHead({ title: 'Tra cứu sách · Thư viện Đại học' })

const keyword = ref('')
const maTacGia = ref<number | ''>('')
const maTheLoai = ref<number | ''>('')

const debouncedKeyword = refDebounced(keyword, 300)

const filter = computed(() => ({
  keyword: debouncedKeyword.value.trim() || undefined,
  maTacGia: maTacGia.value === '' ? undefined : Number(maTacGia.value),
  maTheLoai: maTheLoai.value === '' ? undefined : Number(maTheLoai.value),
}))

const { data: books, isPending, error, refetch } = useBooks(filter)
const { data: authors } = useAuthors()
const { data: genres } = useGenres()

const { page, items: pagedBooks, total, limit, reset } = usePagedList(books, 12)
watch(filter, reset)

const hasFilter = computed(
  () => Boolean(filter.value.keyword || filter.value.maTacGia || filter.value.maTheLoai),
)

function clearFilters() {
  keyword.value = ''
  maTacGia.value = ''
  maTheLoai.value = ''
}
</script>

<template>
  <div>
    <CommonPageHeader
      title="Tra cứu sách"
      description="Tìm theo tên sách, mã ISBN hoặc tên tác giả"
    />

    <UiCard class="mb-6 p-4">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <div class="relative">
          <Search
            class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <UiInput
            v-model="keyword"
            class="pl-9"
            type="search"
            placeholder="Tên sách, ISBN hoặc tác giả..."
            aria-label="Từ khoá tìm kiếm"
          />
        </div>

        <UiSelect v-model="maTacGia" aria-label="Lọc theo tác giả">
          <option value="">Tất cả tác giả</option>
          <option v-for="a in authors" :key="a.MaTacGia" :value="a.MaTacGia">
            {{ a.TenTacGia }}
          </option>
        </UiSelect>

        <UiSelect v-model="maTheLoai" aria-label="Lọc theo thể loại">
          <option value="">Tất cả thể loại</option>
          <option v-for="g in genres" :key="g.MaTheLoai" :value="g.MaTheLoai">
            {{ g.TenTheLoai }}
          </option>
        </UiSelect>
      </div>

      <div v-if="hasFilter" class="mt-3 flex items-center justify-between gap-3">
        <p class="text-sm text-muted-foreground" aria-live="polite">
          Tìm thấy <span class="font-medium text-foreground">{{ books?.length ?? 0 }}</span> đầu sách
        </p>
        <UiButton variant="ghost" size="sm" @click="clearFilters">Xoá bộ lọc</UiButton>
      </div>
    </UiCard>

    <CommonQueryState
      :pending="isPending"
      :error="error"
      :empty="!books?.length"
      empty-title="Không tìm thấy sách nào"
      empty-description="Thử đổi từ khoá hoặc bỏ bớt bộ lọc."
      @retry="refetch()"
    >
      <template #skeleton>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <UiSkeleton v-for="i in 6" :key="i" class="h-40 w-full rounded-xl" />
        </div>
      </template>

      <template #empty-action>
        <UiButton v-if="hasFilter" variant="outline" size="sm" @click="clearFilters">
          <SearchX aria-hidden="true" />
          Xoá bộ lọc
        </UiButton>
      </template>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <BookCard v-for="b in pagedBooks" :key="b.MaSach" :book="b" />
      </div>

      <CommonPagination v-model:page="page" :total="total" :limit="limit" />
    </CommonQueryState>
  </div>
</template>
