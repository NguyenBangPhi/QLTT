/**
 * Đồng bộ tab đang mở với query param để tải lại trang vẫn giữ đúng tab, và để chia sẻ
 * được đường dẫn tới đúng tab mình đang xem.
 *
 * Dùng router.replace chứ không push: mỗi lần bấm tab mà thêm một mục vào lịch sử thì
 * nút quay lại của trình duyệt sẽ phải bấm rất nhiều lần mới rời được trang.
 */
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

  // Người dùng bấm quay lại hoặc dán đường dẫn khác vào thanh địa chỉ
  watch(
    () => route.query[queryKey],
    () => {
      const value = readFromQuery()
      if (value && value !== tab.value) tab.value = value
    },
  )

  return tab
}
