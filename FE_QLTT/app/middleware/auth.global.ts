import { useAuthStore } from '~/stores/auth'

/**
 * Chặn truy cập ở một chỗ duy nhất. Trang khai báo yêu cầu của mình bằng definePageMeta:
 *   definePageMeta({ public: true })                 -> ai cũng vào được
 *   definePageMeta({ roles: ['Admin', 'Thủ thư'] })  -> chỉ các vai trò này
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  await auth.init()

  if (to.meta.public) {
    // Đã đăng nhập rồi thì không cần thấy trang đăng nhập nữa
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
