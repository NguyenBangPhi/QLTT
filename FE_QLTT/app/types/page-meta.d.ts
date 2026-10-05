import type { TenVaiTro } from './api'

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    roles?: TenVaiTro[]
  }
}

export {}
