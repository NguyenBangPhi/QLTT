export class ApiError extends Error {
  readonly statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}

interface BackendErrorBody {
  statusCode?: number
  /** Lỗi nghiệp vụ là chuỗi; lỗi ValidationPipe là mảng chuỗi */
  message?: string | string[]
  error?: string
}

const FALLBACK_BY_STATUS: Record<number, string> = {
  401: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
  403: 'Bạn không có quyền thực hiện thao tác này.',
  404: 'Không tìm thấy dữ liệu.',
  500: 'Máy chủ gặp sự cố, vui lòng thử lại sau.',
  503: 'Không kết nối được tới máy chủ.',
}

/**
 * Chuẩn hoá lỗi từ Backend về một kiểu duy nhất.
 *
 * Message nghiệp vụ được giữ nguyên văn vì Stored Procedure đã viết sẵn tiếng Việt
 * chuẩn (ví dụ "Sinh viên đã mượn vượt quá số lượng sách tối đa cho phép."), hiển thị
 * thẳng cho người dùng là hợp lý nhất.
 */
export function normalizeApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err

  const fetchError = err as { statusCode?: number; status?: number; data?: BackendErrorBody }
  const status = fetchError?.data?.statusCode ?? fetchError?.statusCode ?? fetchError?.status ?? 0
  const raw = fetchError?.data?.message

  if (Array.isArray(raw) && raw.length > 0) {
    return new ApiError(raw.join('. '), status)
  }
  if (typeof raw === 'string' && raw.trim()) {
    return new ApiError(raw, status)
  }
  if (FALLBACK_BY_STATUS[status]) {
    return new ApiError(FALLBACK_BY_STATUS[status], status)
  }
  if (err instanceof Error && err.message) {
    return new ApiError(err.message, status)
  }
  return new ApiError('Đã có lỗi xảy ra.', status)
}
