import type { TenVaiTro } from './api'

declare module 'vue-router' {
  interface RouteMeta {
    /** Vào được mà không cần đăng nhập */
    public?: boolean
    /** Danh sách vai trò được phép; bỏ trống nghĩa là chỉ cần đã đăng nhập */
    roles?: TenVaiTro[]
  }
}

export {}
