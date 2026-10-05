<script setup lang="ts">
import { Pencil, Plus, Trash2 } from 'lucide-vue-next'

const props = defineProps<{ resource: 'authors' | 'genres' }>()

const authors = useAuthors()
const genres = useGenres()
const authorCrud = useAuthorCrud()
const genreCrud = useGenreCrud()

const isAuthors = computed(() => props.resource === 'authors')

const meta = computed(() =>
  isAuthors.value
    ? { label: 'tác giả', column: 'Tên tác giả', field: 'TenTacGia' as const }
    : { label: 'thể loại', column: 'Tên thể loại', field: 'TenTheLoai' as const },
)

const query = computed(() => (isAuthors.value ? authors : genres))
const crud = computed(() => (isAuthors.value ? authorCrud : genreCrud))

interface Row {
  id: number
  name: string
}

const rows = computed<Row[]>(() => {
  if (isAuthors.value) {
    return (authors.data.value ?? []).map((a) => ({ id: a.MaTacGia, name: a.TenTacGia }))
  }
  return (genres.data.value ?? []).map((g) => ({ id: g.MaTheLoai, name: g.TenTheLoai }))
})

const formOpen = ref(false)
const editing = ref<Row | null>(null)
const name = ref('')
const touched = ref(false)

const nameError = computed(() =>
  touched.value && !name.value.trim() ? `Vui lòng nhập ${meta.value.label}` : '',
)

function openCreate() {
  editing.value = null
  name.value = ''
  touched.value = false
  formOpen.value = true
}

function openEdit(row: Row) {
  editing.value = row
  name.value = row.name
  touched.value = false
  formOpen.value = true
}

const saving = computed(() => crud.value.create.isPending.value || crud.value.update.isPending.value)

function save() {
  touched.value = true
  const value = name.value.trim()
  if (!value) return

  const payload = { [meta.value.field]: value } as never
  const done = { onSuccess: () => (formOpen.value = false) }

  if (editing.value) {
    crud.value.update.mutate({ id: editing.value.id, payload }, done)
  } else {
    crud.value.create.mutate(payload, done)
  }
}

const deleting = ref<Row | null>(null)
const deleteOpen = computed({
  get: () => deleting.value !== null,
  set: (v) => {
    if (!v) deleting.value = null
  },
})

function confirmDelete() {
  if (!deleting.value) return
  crud.value.remove.mutate(deleting.value.id, { onSuccess: () => (deleting.value = null) })
}
</script>

<template>
  <div>
    <CommonPageHeader
      :title="isAuthors ? 'Tác giả' : 'Thể loại'"
      :description="`Quản lý danh mục ${meta.label} dùng cho việc phân loại sách`"
    >
      <template #actions>
        <UiButton @click="openCreate">
          <Plus aria-hidden="true" />
          Thêm {{ meta.label }}
        </UiButton>
      </template>
    </CommonPageHeader>

    <CommonQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
      :empty="!rows.length"
      :empty-title="`Chưa có ${meta.label} nào`"
      @retry="query.refetch()"
    >
      <UiTable>
        <thead>
          <tr>
            <th class="w-20">Mã</th>
            <th>{{ meta.column }}</th>
            <th class="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td class="font-mono text-xs text-muted-foreground">{{ row.id }}</td>
            <td class="font-medium">{{ row.name }}</td>
            <td>
              <div class="flex justify-end gap-1">
                <UiButton
                  variant="ghost"
                  size="icon"
                  :aria-label="`Sửa ${row.name}`"
                  @click="openEdit(row)"
                >
                  <Pencil aria-hidden="true" />
                </UiButton>
                <UiButton
                  variant="ghost"
                  size="icon"
                  :aria-label="`Xoá ${row.name}`"
                  @click="deleting = row"
                >
                  <Trash2 class="text-destructive" aria-hidden="true" />
                </UiButton>
              </div>
            </td>
          </tr>
        </tbody>
      </UiTable>
    </CommonQueryState>

    <UiDialog
      v-model:open="formOpen"
      :title="editing ? `Sửa ${meta.label}` : `Thêm ${meta.label}`"
      class="max-w-md"
    >
      <form id="catalog-form" novalidate @submit.prevent="save">
        <div class="space-y-1.5">
          <label for="catalog-name" class="text-sm font-medium">{{ meta.column }}</label>
          <UiInput id="catalog-name" v-model="name" :aria-invalid="Boolean(nameError)" @blur="touched = true" />
          <p v-if="nameError" class="text-xs text-destructive">{{ nameError }}</p>
        </div>
      </form>

      <template #footer>
        <UiButton variant="outline" @click="formOpen = false">Huỷ</UiButton>
        <UiButton type="submit" form="catalog-form" :loading="saving">
          {{ editing ? 'Lưu thay đổi' : 'Thêm' }}
        </UiButton>
      </template>
    </UiDialog>

    <UiDialog v-model:open="deleteOpen" :title="`Xoá ${meta.label}`" class="max-w-md">
      <p class="text-sm">
        Bạn chắc chắn muốn xoá <span class="font-medium">{{ deleting?.name }}</span>?
      </p>
      <p class="mt-2 text-sm text-muted-foreground">
        Nếu vẫn còn sách thuộc {{ meta.label }} này, hệ thống sẽ từ chối do ràng buộc khoá ngoại.
      </p>

      <template #footer>
        <UiButton variant="outline" @click="deleting = null">Huỷ</UiButton>
        <UiButton
          variant="destructive"
          :loading="crud.remove.isPending.value"
          @click="confirmDelete"
        >
          Xoá
        </UiButton>
      </template>
    </UiDialog>
  </div>
</template>
