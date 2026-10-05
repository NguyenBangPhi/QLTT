import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  await auth.init()

  if (to.meta.public) {
    if (auth.isAuthenticated && to.path === '/login') {
      return navigateTo(auth.homePath)
    }
    return
  }

  if (!auth.isAuthenticated) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  const allowed = to.meta.roles
  if (allowed?.length && auth.role && !allowed.includes(auth.role)) {
    return navigateTo('/khong-du-quyen')
  }
})
