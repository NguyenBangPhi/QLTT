import { useAuthStore } from '~/stores/auth'

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
      if (!auth.token) return
      auth.clear()
      await navigateTo('/login')
    },
  })

  return { provide: { api } }
})
