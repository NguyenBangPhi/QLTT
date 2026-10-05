<script setup lang="ts">
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { Search } from 'lucide-vue-next'
import { formatDate } from '~/lib/format'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'admin', roles: ['Admin'] })

const auth = useAuthStore()
useHead({ title: 'Tài khoản & thẻ · Quản trị thư viện' })

const tab = useTabQuery(['users', 'cards'])

const users = useUsers()
const updateUserStatus = useUpdateUserStatus()

const userKeyword = ref('')
const filteredUsers = computed(() => {
  const kw = userKeyword.value.trim().toLowerCase()
  if (!kw) return users.data.value ?? []
  return (users.data.value ?? []).filter(
    (u) => u.HoTen.toLowerCase().includes(kw) || u.TenDangNhap.toLowerCase().includes(kw),
  )
})

const userPage = reactive(usePagedList(filteredUsers, 20))
watch(userKeyword, userPage.reset)

const studentKeyword = ref('')
const debouncedStudent = refDebounced(studentKeyword, 300)
const students = useStudents(debouncedStudent)
const updateCard = useUpdateCardStatus()

const studentPage = reactive(usePagedList(students.data, 20))
watch(debouncedStudent, studentPage.reset)
</script>

<template>
  <div>
    <CommonPageHeader
      title="Tài khoản & thẻ"
      description="Khoá hoặc mở tài khoản đăng nhập và thẻ thư viện của sinh viên"
    />

    <TabsRoot v-model="tab">
      <TabsList class="mb-6 inline-flex gap-1 rounded-lg border bg-muted/50 p-1" aria-label="Loại quản lý">
        <TabsTrigger
          value="users"
          class="rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
        >
          Tài khoản đăng nhập
        </TabsTrigger>
        <TabsTrigger
          value="cards"
          class="rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
        >
          Thẻ thư viện
        </TabsTrigger>
      </TabsList>

      <TabsContent value="users" class="focus:outline-none">
        <div class="relative mb-4 max-w-md">
          <Search
            class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <UiInput
            v-model="userKeyword"
            class="pl-9"
            type="search"
            placeholder="Tìm theo họ tên hoặc tên đăng nhập..."
            aria-label="Tìm tài khoản"
          />
        </div>

        <CommonQueryState
          :pending="users.isPending.value"
          :error="users.error.value"
          :empty="!filteredUsers.length"
          empty-title="Không tìm thấy tài khoản nào"
          @retry="users.refetch()"
        >
          <UiTable>
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Tên đăng nhập</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th class="text-right">Hoạt động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in userPage.items" :key="u.MaNguoiDung">
                <td class="font-medium">{{ u.HoTen }}</td>
                <td class="font-mono text-xs">{{ u.TenDangNhap }}</td>
                <td class="max-w-52 truncate text-muted-foreground">{{ u.Email || '—' }}</td>
                <td><UiBadge variant="outline">{{ u.TenVaiTro }}</UiBadge></td>
                <td class="tabular-nums">{{ formatDate(u.NgayTao) }}</td>
                <td>
                  <div class="flex items-center justify-end gap-2">
                    <span class="text-xs text-muted-foreground">
                      {{
                        u.MaNguoiDung === auth.user?.MaNguoiDung
                          ? 'Tài khoản của bạn'
                          : u.TrangThai === 1
                            ? 'Đang mở'
                            : 'Đã khoá'
                      }}
                    </span>
                    <UiSwitch
                      :model-value="u.TrangThai === 1"
                      :label="`Khoá hoặc mở tài khoản ${u.HoTen}`"
                      :disabled="
                        updateUserStatus.isPending.value ||
                        u.MaNguoiDung === auth.user?.MaNguoiDung
                      "
                      @update:model-value="
                        updateUserStatus.mutate({
                          id: u.MaNguoiDung,
                          trangThai: $event ? 1 : 0,
                        })
                      "
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </UiTable>

          <CommonPagination
            v-model:page="userPage.page"
            :total="userPage.total"
            :limit="userPage.limit"
          />
        </CommonQueryState>
      </TabsContent>

      <TabsContent value="cards" class="focus:outline-none">
        <div class="relative mb-4 max-w-md">
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

        <CommonQueryState
          :pending="students.isPending.value"
          :error="students.error.value"
          :empty="!students.data.value?.length"
          empty-title="Không tìm thấy sinh viên nào"
          @retry="students.refetch()"
        >
          <UiTable>
            <thead>
              <tr>
                <th>Mã SV</th>
                <th>Họ tên</th>
                <th>Lớp / Khoa</th>
                <th>Hạn thẻ</th>
                <th class="text-right">Đang mượn</th>
                <th class="text-right">Thẻ hoạt động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in studentPage.items" :key="s.MaSV">
                <td class="font-mono text-xs">{{ s.MaSV }}</td>
                <td class="font-medium">{{ s.HoTen }}</td>
                <td class="text-muted-foreground">{{ s.Lop }} · {{ s.Khoa }}</td>
                <td class="tabular-nums">{{ formatDate(s.NgayHetHanThe) }}</td>
                <td class="text-right tabular-nums">{{ s.SoSachDangMuon }}</td>
                <td>
                  <div class="flex items-center justify-end gap-2">
                    <span class="text-xs text-muted-foreground">
                      {{ s.TrangThaiThe === 1 ? 'Hoạt động' : 'Đã khoá' }}
                    </span>
                    <UiSwitch
                      :model-value="s.TrangThaiThe === 1"
                      :label="`Khoá hoặc mở thẻ của ${s.HoTen}`"
                      :disabled="updateCard.isPending.value"
                      @update:model-value="
                        updateCard.mutate({ maSV: s.MaSV, trangThaiThe: $event ? 1 : 0 })
                      "
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </UiTable>

          <CommonPagination
            v-model:page="studentPage.page"
            :total="studentPage.total"
            :limit="studentPage.limit"
          />
        </CommonQueryState>
      </TabsContent>
    </TabsRoot>
  </div>
</template>
