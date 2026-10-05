import { MutationCache, QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { normalizeApiError } from '~/lib/api-error'

export default defineNuxtPlugin((nuxtApp) => {
  const queryClient = new QueryClient({
    // Mọi mutation thất bại đều báo lỗi ở đây, không component nào phải tự bắt.
    // Message nghiệp vụ từ Stored Procedure hiển thị nguyên văn.
    mutationCache: new MutationCache({
      onError(error) {
        const { statusCode, message } = normalizeApiError(error)
        // 401 đã được plugin api xử lý bằng cách đăng xuất, báo thêm chỉ gây nhiễu
        if (statusCode === 401) return
        toast.error(message)
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Thử lại chỉ có ích với lỗi mạng. Sai quyền hay không tìm thấy thì thử lại
        // bao nhiêu lần cũng vậy, chỉ làm người dùng chờ lâu hơn.
        retry(failureCount, error) {
          const { statusCode } = normalizeApiError(error)
          if ([400, 401, 403, 404].includes(statusCode)) return false
          return failureCount < 2
        },
      },
    },
  })

  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient })
})
