export function usePagedList<T>(source: MaybeRefOrGetter<T[] | undefined>, limit: number) {
  const page = ref(1)
  const total = computed(() => toValue(source)?.length ?? 0)

  const items = computed(() =>
    (toValue(source) ?? []).slice((page.value - 1) * limit, page.value * limit),
  )

  watch(total, (count) => {
    const lastPage = Math.max(1, Math.ceil(count / limit))
    if (page.value > lastPage) page.value = lastPage
  })

  function reset() {
    page.value = 1
  }

  return { page, total, items, limit, reset }
}
