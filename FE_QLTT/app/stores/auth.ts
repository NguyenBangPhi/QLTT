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
