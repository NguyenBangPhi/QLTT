<script setup lang="ts">
import { AlertTriangle, Check, Lock, Plus, Search, Trash2, UserCheck } from 'lucide-vue-next'
import { formatDate, isoDateFromToday } from '~/lib/format'
import type { Book, Student } from '~/types/api'

const soSachToiDa = useConfigNumber('SO_SACH_TOI_DA', 3)
const soNgayMuonToiDa = useConfigNumber('SO_NGAY_MUON_TOI_DA', 14)

const studentKeyword = ref('')
const debouncedStudent = refDebounced(studentKeyword, 300)
const { data: students, isPending: loadingStudents } = useStudents(debouncedStudent)
const selected = ref<Student | null>(null)

const bookKeyword = ref('')
const debouncedBook = refDebounced(bookKeyword, 300)
const bookFilter = computed(() => ({ keyword: debouncedBook.value.trim() || undefined }))
const { data: books } = useBooks(bookFilter)
const cart = ref<Book[]>([])

const danhSachGoiY = computed(() => {
  const list = books.value ?? []
  if (debouncedBook.value.trim()) return list
  return [...list].filter((b) => b.SoLuongTon > 0).sort((a, b) => b.SoLuongTon - a.SoLuongTon).slice(0, 8)
})

function addToCart(book: Book) {
  if (cart.value.some((b) => b.MaSach === book.MaSach)) return
  cart.value.push(book)
  bookKeyword.value = ''
}

function removeFromCart(maSach: number) {
  cart.value = cart.value.filter((b) => b.MaSach !== maSach)
}

const ngayHenTra = ref(isoDateFromToday(soNgayMuonToiDa.value))
const dateTouched = ref(false)
watch(soNgayMuonToiDa, (days) => {
  if (!dateTouched.value) ngayHenTra.value = isoDateFromToday(days)
})

function moLich(event: MouseEvent) {
  const input = event.target as HTMLInputElement & { showPicker?: () => void }
  try {
    input.showPicker?.()
  } catch {
    return
  }
}

const theBiKhoa = computed(() => selected.value?.TrangThaiThe === 0)
const tongSauKhiMuon = computed(() => (selected.value?.SoSachDangMuon ?? 0) + cart.value.length)
const vuotHanMuc = computed(() => Boolean(selected.value) && tongSauKhiMuon.value > soSachToiDa.value)
const coSachHet = computed(() => cart.value.some((b) => b.SoLuongTon <= 0))

const borrow = useBorrowBooks()

const canSubmit = computed(
  () => Boolean(selected.value) && cart.value.length > 0 && Boolean(ngayHenTra.value),
)

function submit() {
  if (!selected.value) return
  borrow.mutate(
    {
      maSV: selected.value.MaSV,
      jsonSach: cart.value.map((b) => b.MaSach),
      ngayHenTra: ngayHenTra.value,
    },
    {
      onSuccess() {
        cart.value = []
        selected.value = null
        studentKeyword.value = ''
        dateTouched.value = false
        ngayHenTra.value = isoDateFromToday(soNgayMuonToiDa.value)
      },
    },
  )
}
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-2">
    <UiCard class="flex flex-col p-5">
      <h3 class="mb-3 font-semibold">1. Chọn sinh viên</h3>

      <div v-if="selected" class="rounded-lg border border-primary/40 bg-accent/40 p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-medium">{{ selected.HoTen }}</p>
            <p class="font-mono text-sm text-muted-foreground">{{ selected.MaSV }}</p>
            <p class="mt-1 text-sm text-muted-foreground">
              {{ selected.Lop }} · {{ selected.Khoa }}
            </p>
          </div>
          <UiButton variant="ghost" size="sm" @click="selected = null">Đổi</UiButton>
        </div>

        <div class="mt-3 flex flex-wrap gap-2">
          <UiBadge :variant="selected.TrangThaiThe === 1 ? 'success' : 'danger'">
            <component
              :is="selected.TrangThaiThe === 1 ? UserCheck : Lock"
              class="size-3"
              aria-hidden="true"
            />
            {{ selected.TrangThaiThe === 1 ? 'Thẻ hoạt động' : 'Thẻ bị khoá' }}
          </UiBadge>
          <UiBadge :variant="tongSauKhiMuon > soSachToiDa ? 'danger' : 'secondary'">
            Đang mượn {{ selected.SoSachDangMuon }}/{{ soSachToiDa }}
          </UiBadge>
        </div>
      </div>

      <template v-else>
        <div class="relative">
          <Search
            class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <UiInput
            v-model="studentKeyword"
            class="pl-9"
            type="search"
            placeholder="Tìm theo mã sinh viên, họ tên hoặc lớp..."
            aria-label="Tìm sinh viên"
          />
        </div>

        <div class="mt-3 max-h-80 space-y-1.5 overflow-y-auto">
          <template v-if="loadingStudents">
            <UiSkeleton v-for="i in 4" :key="i" class="h-14 w-full" />
          </template>
          <p v-else-if="!students?.length" class="py-6 text-center text-sm text-muted-foreground">
            Không tìm thấy sinh viên nào
          </p>
          <button
            v-for="s in students"
            v-else
            :key="s.MaSV"
            type="button"
            class="flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left hover:bg-accent hover:text-accent-foreground"
            @click="selected = s"
          >
            <span class="min-w-0">
              <span class="block truncate font-medium">{{ s.HoTen }}</span>
              <span class="block font-mono text-xs text-muted-foreground">
                {{ s.MaSV }} · {{ s.Lop }}
              </span>
            </span>
            <UiBadge :variant="s.TrangThaiThe === 1 ? 'success' : 'danger'">
              {{ s.TrangThaiThe === 1 ? `${s.SoSachDangMuon}/${soSachToiDa}` : 'Khoá' }}
            </UiBadge>
          </button>
        </div>
      </template>
    </UiCard>

    <UiCard class="flex flex-col p-5">
      <h3 class="mb-3 font-semibold">2. Chọn sách ({{ cart.length }})</h3>

      <div class="relative">
        <Search
          class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <UiInput
          v-model="bookKeyword"
          class="pl-9"
          type="search"
          placeholder="Tìm sách theo tên, ISBN hoặc tác giả..."
          aria-label="Tìm sách"
        />
      </div>

      <div class="mt-2 max-h-56 space-y-1.5 overflow-y-auto rounded-lg border p-1.5">
        <p v-if="!bookKeyword" class="px-2.5 pt-1 pb-0.5 text-xs text-muted-foreground">
          Sách còn nhiều bản nhất — hoặc gõ ở trên để tìm cuốn khác
        </p>
        <p v-if="!danhSachGoiY.length" class="py-4 text-center text-sm text-muted-foreground">
          Không tìm thấy sách nào
        </p>
        <button
          v-for="b in danhSachGoiY"
          :key="b.MaSach"
          type="button"
          class="flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-left hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          :disabled="cart.some((c) => c.MaSach === b.MaSach)"
          @click="addToCart(b)"
        >
          <span class="min-w-0">
            <span class="block truncate text-sm font-medium">{{ b.TenSach }}</span>
            <span class="block truncate text-xs text-muted-foreground">{{ b.TenTacGia }}</span>
          </span>
          <span class="flex shrink-0 items-center gap-2">
            <BookStockBadge :ton="b.SoLuongTon" />
            <Plus class="size-4" aria-hidden="true" />
          </span>
        </button>
      </div>

      <ul v-if="cart.length" class="mt-3 space-y-1.5">
        <li
          v-for="b in cart"
          :key="b.MaSach"
          class="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
        >
          <span class="min-w-0">
            <span class="block truncate text-sm font-medium">{{ b.TenSach }}</span>
            <span class="block font-mono text-xs text-muted-foreground">{{ b.ISBN }}</span>
          </span>
          <span class="flex shrink-0 items-center gap-2">
            <BookStockBadge :ton="b.SoLuongTon" />
            <UiButton
              variant="ghost"
              size="icon"
              :aria-label="`Bỏ ${b.TenSach} khỏi phiếu`"
              @click="removeFromCart(b.MaSach)"
            >
              <Trash2 class="text-destructive" aria-hidden="true" />
            </UiButton>
          </span>
        </li>
      </ul>
      <p v-else class="mt-3 rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
        Chưa chọn cuốn nào
      </p>

      <div class="mt-4 space-y-1.5">
        <label for="ngay-hen-tra" class="text-sm font-medium">Ngày hẹn trả</label>
        <UiInput
          id="ngay-hen-tra"
          v-model="ngayHenTra"
          type="date"
          class="cursor-pointer"
          :min="isoDateFromToday(1)"
          @change="dateTouched = true"
          @click="moLich"
        />
        <p class="text-xs text-muted-foreground">
          Mặc định {{ soNgayMuonToiDa }} ngày kể từ hôm nay
        </p>
      </div>
    </UiCard>

    <div class="lg:col-span-2">
      <div v-if="theBiKhoa || vuotHanMuc || coSachHet" class="mb-4 space-y-2">
        <div
          v-if="theBiKhoa"
          class="flex gap-2.5 rounded-lg border border-danger-soft bg-danger-soft/50 px-4 py-3 text-sm text-danger-soft-foreground"
          role="alert"
        >
          <Lock class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>Thẻ của sinh viên này đang bị khoá — hệ thống sẽ từ chối phiếu mượn.</span>
        </div>
        <div
          v-if="vuotHanMuc"
          class="flex gap-2.5 rounded-lg border border-danger-soft bg-danger-soft/50 px-4 py-3 text-sm text-danger-soft-foreground"
          role="alert"
        >
          <AlertTriangle class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Sau phiếu này sinh viên sẽ giữ {{ tongSauKhiMuon }} cuốn, vượt hạn mức
            {{ soSachToiDa }} cuốn.
          </span>
        </div>
        <div
          v-if="coSachHet"
          class="flex gap-2.5 rounded-lg border border-warning-soft bg-warning-soft/50 px-4 py-3 text-sm text-warning-soft-foreground"
          role="alert"
        >
          <AlertTriangle class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>Trong phiếu có sách đã hết tồn kho.</span>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card px-5 py-4">
        <p class="text-sm text-muted-foreground">
          <template v-if="canSubmit">
            Lập phiếu cho
            <span class="font-medium text-foreground">{{ selected?.HoTen }}</span>
            · {{ cart.length }} cuốn · hẹn trả
            <span class="font-medium text-foreground tabular-nums">
              {{ formatDate(ngayHenTra) }}
            </span>
          </template>
          <template v-else>Chọn sinh viên và ít nhất một cuốn sách để lập phiếu</template>
        </p>

        <UiButton
          size="lg"
          :disabled="!canSubmit"
          :loading="borrow.isPending.value"
          @click="submit"
        >
          <Check v-if="!borrow.isPending.value" aria-hidden="true" />
          Lập phiếu mượn
        </UiButton>
      </div>
    </div>
  </div>
</template>
