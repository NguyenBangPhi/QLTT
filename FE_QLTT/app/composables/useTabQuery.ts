export function useTabQuery(validTabs: readonly string[], queryKey = 'tab') {
  const route = useRoute()
  const router = useRouter()

  function readFromQuery(): string | null {
    const raw = route.query[queryKey]
    const value = Array.isArray(raw) ? raw[0] : raw
    return typeof value === 'string' && validTabs.includes(value) ? value : null
  }

  const tab = ref(readFromQuery() ?? validTabs[0]!)

  watch(tab, (value) => {
    if (readFromQuery() === value) return
    router.replace({ query: { ...route.query, [queryKey]: value } })
  })

  watch(
    () => route.query[queryKey],
    () => {
      const value = readFromQuery()
      if (value && value !== tab.value) tab.value = value
    },
  )

  return tab
}
