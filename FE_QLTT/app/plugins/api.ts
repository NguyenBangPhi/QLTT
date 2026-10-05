import { useAuthStore } from '~/stores/auth'

/**
 * Một instance $fetch duy nhất cho toàn ứng dụng: tự gắn Bearer token và tự đăng xuất
 * khi token hết hạn. Mọi lời gọi API đều đi qua đây, không component nào tự fetch.
 *
 * baseURL là '/api' (đường dẫn tương đối) vì Nuxt proxy sang Backend — trình duyệt chỉ
 * làm việc với một origin nên không phát sinh preflight CORS.
 */
export default defineNuxtPlugin(() => {
  const api = $fetch.create({
    baseURL: '/api',

    onRequest({ options }) {
      const token = useAuthStore().token
      if (token) options.headers.set('Authorization', `Bearer ${token}`)
    },

    async onResponseError({ response }) {
      if (response.status !== 401) return
      const auth = useAuthStore()
      // Chỉ đá ra ngoài khi đang thực sự có phiên; tránh vòng lặp ở trang đăng nhập
      if (!auth.token) return
      auth.clear()
      await navigateTo('/login')
    },
  })

  return { provide: { api } }
})
