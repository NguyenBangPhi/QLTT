import { MutationCache, QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { normalizeApiError } from '~/lib/api-error'

export default defineNuxtPlugin((nuxtApp) => {
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onError(error) {
        const { statusCode, message } = normalizeApiError(error)
        if (statusCode === 401) return
        toast.error(message)
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
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
