import { defineStore } from 'pinia'
import type { CurrentUser, LoginResponse, TenVaiTro } from '~/types/api'

const TOKEN_KEY = 'qltt.token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<CurrentUser | null>(null)
  const initialized = ref(false)

  const role = computed<TenVaiTro | null>(() => user.value?.TenVaiTro ?? null)
  const isAdmin = computed(() => role.value === 'Admin')
  const isStaff = computed(() => role.value === 'Admin' || role.value === 'Thủ thư')
  const isStudent = computed(() => role.value === 'Sinh viên')
  const isAuthenticated = computed(() => Boolean(token.value && user.value))

  /** Trang mặc định sau khi đăng nhập, theo đúng hai khu vực của đặc tả */
  const homePath = computed(() => (isStaff.value ? '/admin' : '/'))

  function setToken(value: string) {
    token.value = value
    localStorage.setItem(TOKEN_KEY, value)
  }

  function clear() {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  /**
   * Hồ sơ người dùng luôn lấy từ GET /api/auth/me chứ không giải mã JWT ở client.
   * Như vậy khi admin khoá tài khoản hoặc đổi vai trò, lần tải trang kế tiếp sẽ phản ánh
   * đúng trạng thái thật thay vì tin vào token cũ.
   */
  async function fetchMe() {
    const { $api } = useNuxtApp()
    user.value = await $api<CurrentUser>('/auth/me')
  }

  async function login(username: string, password: string) {
    const { $api } = useNuxtApp()
    const res = await $api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    setToken(res.access_token)
    await fetchMe()
  }

  function logout() {
    clear()
    return navigateTo('/login')
  }

  /** Khôi phục phiên khi tải lại trang. Token hỏng hoặc hết hạn thì xoá luôn. */
  async function init() {
    if (initialized.value) return
    token.value = localStorage.getItem(TOKEN_KEY)
    if (token.value) {
      try {
        await fetchMe()
      } catch {
        clear()
      }
    }
    initialized.value = true
  }

  return {
    token,
    user,
    role,
    isAdmin,
    isStaff,
    isStudent,
    isAuthenticated,
    homePath,
    setToken,
    clear,
    fetchMe,
    login,
    logout,
    init,
  }
})
