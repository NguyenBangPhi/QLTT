<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { AlertTriangle, Pencil, Plus, Search, Trash2 } from 'lucide-vue-next'
import { z } from 'zod'
import type { Book } from '~/types/api'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'admin', roles: ['Admin', 'Thủ thư'] })
useHead({ title: 'Quản lý sách · Quản trị thư viện' })

const auth = useAuthStore()

const keyword = ref('')
const debounced = refDebounced(keyword, 300)
const filter = computed(() => ({ keyword: debounced.value.trim() || undefined }))
const { data: books, isPending, error, refetch } = useBooks(filter)
const { data: authors } = useAuthors()
const { data: genres } = useGenres()

const createBook = useCreateBook()
const updateBook = useUpdateBook()
const deleteBook = useDeleteBook()

const editing = ref<Book | null>(null)
const formOpen = ref(false)

const namHienTai = new Date().getFullYear()
const danhSachNam = Array.from({ length: namHienTai - 1899 }, (_, i) => namHienTai - i)

const schema = toTypedSchema(
  z.object({
    ISBN: z.string().trim().min(1, 'Vui lòng nhập mã ISBN'),
    TenSach: z.string().trim().min(1, 'Vui lòng nhập tên sách'),
    MaTacGia: z.string().min(1, 'Vui lòng chọn tác giả'),
    MaTheLoai: z.string().min(1, 'Vui lòng chọn thể loại'),
    NhaXuatBan: z.string().trim().optional(),
    NamXuatBan: z.string().optional(),
    SoLuongTong: z
      .number({
        required_error: 'Vui lòng nhập số lượng',
        invalid_type_error: 'Vui lòng nhập số lượng',
      })
      .int('Số lượng phải là số nguyên')
      .min(0, 'Số lượng không được âm'),
  }),
)

const { handleSubmit, errors, defineField, resetForm, values } = useForm({ validationSchema: schema })
const [ISBN, isbnAttrs] = defineField('ISBN')
const [TenSach, tenSachAttrs] = defineField('TenSach')
const [MaTacGia, maTacGiaAttrs] = defineField('MaTacGia')
const [MaTheLoai, maTheLoaiAttrs] = defineField('MaTheLoai')
const [NhaXuatBan, nxbAttrs] = defineField('NhaXuatBan')
const [NamXuatBan, namAttrs] = defineField('NamXuatBan')
const [SoLuongTong, soLuongAttrs] = defineField('SoLuongTong')

function openCreate() {
  editing.value = null
  resetForm({
    values: {
      ISBN: '',
      TenSach: '',
      MaTacGia: '',
      MaTheLoai: '',
      NhaXuatBan: '',
      NamXuatBan: '',
      SoLuongTong: 1,
    },
  })
  formOpen.value = true
}

function openEdit(book: Book) {
  editing.value = book
  resetForm({
    values: {
      ISBN: book.ISBN,
      TenSach: book.TenSach,
      MaTacGia: String(book.MaTacGia),
      MaTheLoai: String(book.MaTheLoai),
      NhaXuatBan: book.NhaXuatBan ?? '',
      NamXuatBan: book.NamXuatBan ? String(book.NamXuatBan) : '',
      SoLuongTong: book.SoLuongTong,
    },
  })
  formOpen.value = true
}

const soDangMuon = computed(() =>
  editing.value ? editing.value.SoLuongTong - editing.value.SoLuongTon : 0,
)
const giamQuaMuc = computed(
  () => Boolean(editing.value) && Number(values.SoLuongTong || 0) < soDangMuon.value,
)

const onSubmit = handleSubmit((formValues) => {
  const payload = {
    ISBN: formValues.ISBN,
    TenSach: formValues.TenSach,
    MaTacGia: Number(formValues.MaTacGia),
    MaTheLoai: Number(formValues.MaTheLoai),
    NhaXuatBan: formValues.NhaXuatBan || null,
    NamXuatBan: formValues.NamXuatBan ? Number(formValues.NamXuatBan) : null,
    SoLuongTong: formValues.SoLuongTong,
  }
  const done = { onSuccess: () => (formOpen.value = false) }
  if (editing.value) {
    updateBook.mutate({ id: editing.value.MaSach, payload }, done)
  } else {
    createBook.mutate(payload, done)
  }
})

const deleting = ref<Book | null>(null)
const deleteOpen = computed({
  get: () => deleting.value !== null,
  set: (v) => {
    if (!v) deleting.value = null
  },
})

function confirmDelete() {
  if (!deleting.value) return
  deleteBook.mutate(deleting.value.MaSach, { onSuccess: () => (deleting.value = null) })
}
</script>

<template>
  <div>
    <CommonPageHeader title="Quản lý sách" description="Thêm, sửa và xoá đầu sách trong thư viện">
      <template #actions>
        <UiButton @click="openCreate">
          <Plus aria-hidden="true" />
          Thêm sách
        </UiButton>
      </template>
    </CommonPageHeader>

    <div class="relative mb-4 max-w-md">
      <Search
        class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <UiInput
        v-model="keyword"
        class="pl-9"
        type="search"
        placeholder="Tìm theo tên sách, ISBN hoặc tác giả..."
        aria-label="Tìm sách"
      />
    </div>

    <CommonQueryState
      :pending="isPending"
      :error="error"
      :empty="!books?.length"
      empty-title="Chưa có đầu sách nào"
      @retry="refetch()"
    >
      <UiTable>
        <thead>
          <tr>
            <th>ISBN</th>
            <th>Tên sách</th>
            <th>Tác giả</th>
            <th>Thể loại</th>
            <th class="text-right">Tồn / Tổng</th>
            <th class="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in books" :key="b.MaSach">
            <td class="font-mono text-xs">{{ b.ISBN }}</td>
            <td class="max-w-64 truncate font-medium">{{ b.TenSach }}</td>
            <td class="text-muted-foreground">{{ b.TenTacGia }}</td>
            <td><UiBadge variant="outline">{{ b.TenTheLoai }}</UiBadge></td>
            <td class="text-right">
              <BookStockBadge :ton="b.SoLuongTon" :tong="b.SoLuongTong" />
            </td>
            <td>
              <div class="flex justify-end gap-1">
                <UiButton
                  variant="ghost"
                  size="icon"
                  :aria-label="`Sửa ${b.TenSach}`"
                  @click="openEdit(b)"
                >
                  <Pencil aria-hidden="true" />
                </UiButton>
                <UiButton
                  v-if="auth.isAdmin"
                  variant="ghost"
                  size="icon"
                  :aria-label="`Xoá ${b.TenSach}`"
                  @click="deleting = b"
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
      :title="editing ? 'Sửa thông tin sách' : 'Thêm sách mới'"
      :description="editing ? editing.TenSach : 'Điền đầy đủ thông tin của đầu sách'"
    >
      <form id="book-form" class="space-y-4" novalidate @submit="onSubmit">
        <div class="space-y-1.5">
          <label for="f-isbn" class="text-sm font-medium">Mã ISBN</label>
          <UiInput id="f-isbn" v-model="ISBN" v-bind="isbnAttrs" placeholder="978-..." />
          <p v-if="errors.ISBN" class="text-xs text-destructive">{{ errors.ISBN }}</p>
        </div>

        <div class="space-y-1.5">
          <label for="f-ten" class="text-sm font-medium">Tên sách</label>
          <UiInput id="f-ten" v-model="TenSach" v-bind="tenSachAttrs" />
          <p v-if="errors.TenSach" class="text-xs text-destructive">{{ errors.TenSach }}</p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <label for="f-tacgia" class="text-sm font-medium">Tác giả</label>
            <UiSelect id="f-tacgia" v-model="MaTacGia" v-bind="maTacGiaAttrs">
              <option value="">— Chọn tác giả —</option>
              <option v-for="a in authors" :key="a.MaTacGia" :value="String(a.MaTacGia)">
                {{ a.TenTacGia }}
              </option>
            </UiSelect>
            <p v-if="errors.MaTacGia" class="text-xs text-destructive">{{ errors.MaTacGia }}</p>
          </div>

          <div class="space-y-1.5">
            <label for="f-theloai" class="text-sm font-medium">Thể loại</label>
            <UiSelect id="f-theloai" v-model="MaTheLoai" v-bind="maTheLoaiAttrs">
              <option value="">— Chọn thể loại —</option>
              <option v-for="g in genres" :key="g.MaTheLoai" :value="String(g.MaTheLoai)">
                {{ g.TenTheLoai }}
              </option>
            </UiSelect>
            <p v-if="errors.MaTheLoai" class="text-xs text-destructive">{{ errors.MaTheLoai }}</p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <label for="f-nxb" class="text-sm font-medium">Nhà xuất bản</label>
            <UiInput id="f-nxb" v-model="NhaXuatBan" v-bind="nxbAttrs" />
          </div>
          <div class="space-y-1.5">
            <label for="f-nam" class="text-sm font-medium">Năm xuất bản</label>
            <UiSelect id="f-nam" v-model="NamXuatBan" v-bind="namAttrs">
              <option value="">— Không ghi rõ —</option>
              <option v-for="y in danhSachNam" :key="y" :value="String(y)">{{ y }}</option>
            </UiSelect>
            <p v-if="errors.NamXuatBan" class="text-xs text-destructive">{{ errors.NamXuatBan }}</p>
          </div>
        </div>

        <div class="space-y-1.5">
          <label for="f-soluong" class="text-sm font-medium">Tổng số bản</label>
          <UiInput
            id="f-soluong"
            v-model="SoLuongTong"
            v-bind="soLuongAttrs"
            type="number"
            min="0"
          />
          <p v-if="errors.SoLuongTong" class="text-xs text-destructive">{{ errors.SoLuongTong }}</p>
          <p v-if="editing" class="text-xs text-muted-foreground">
            Hiện có {{ soDangMuon }} bản đang được mượn. Tồn kho sẽ tự cộng trừ theo mức thay đổi.
          </p>
        </div>

        <div
          v-if="giamQuaMuc"
          class="flex gap-2.5 rounded-lg border border-warning-soft bg-warning-soft/50 px-3 py-2.5 text-sm text-warning-soft-foreground"
          role="alert"
        >
          <AlertTriangle class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Tổng số bản đang nhỏ hơn số bản đang được mượn ({{ soDangMuon }}). Hệ thống sẽ từ chối
            vì tồn kho không được âm.
          </span>
        </div>
      </form>

      <template #footer>
        <UiButton variant="outline" @click="formOpen = false">Huỷ</UiButton>
        <UiButton
          type="submit"
          form="book-form"
          :loading="createBook.isPending.value || updateBook.isPending.value"
        >
          {{ editing ? 'Lưu thay đổi' : 'Thêm sách' }}
        </UiButton>
      </template>
    </UiDialog>

    <UiDialog
      v-model:open="deleteOpen"
      title="Xoá sách"
      description="Thao tác này không thể hoàn tác."
    >
      <p class="text-sm">
        Bạn chắc chắn muốn xoá
        <span class="font-medium">{{ deleting?.TenSach }}</span> khỏi hệ thống?
      </p>
      <p class="mt-2 text-sm text-muted-foreground">
        Nếu sách đang có sinh viên mượn, hệ thống sẽ tự động chặn thao tác này.
      </p>

      <template #footer>
        <UiButton variant="outline" @click="deleting = null">Huỷ</UiButton>
        <UiButton variant="destructive" :loading="deleteBook.isPending.value" @click="confirmDelete">
          Xoá sách
        </UiButton>
      </template>
    </UiDialog>
  </div>
</template>
