import {
  Bell,
  BookMarked,
  BookOpen,
  ClipboardList,
  FileClock,
  IdCard,
  LayoutDashboard,
  Search,
  Settings,
  Shapes,
  UserCog,
  Users,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import type { TenVaiTro } from '~/types/api'

export interface NavItem {
  label: string
  to: string
  icon: Component
  roles?: TenVaiTro[]
}

export const clientNav: NavItem[] = [
  { label: 'Tra cứu sách', to: '/', icon: Search },
  { label: 'Thẻ thư viện', to: '/profile', icon: IdCard },
  { label: 'Mượn trả của tôi', to: '/my-borrowings', icon: BookMarked },
  { label: 'Thông báo', to: '/notifications', icon: Bell },
]

export const adminNav: NavItem[] = [
  { label: 'Tổng quan', to: '/admin', icon: LayoutDashboard },
  { label: 'Quầy mượn trả', to: '/admin/counter', icon: ClipboardList },
  { label: 'Quản lý sách', to: '/admin/books', icon: BookOpen },
  { label: 'Tác giả', to: '/admin/authors', icon: Users },
  { label: 'Thể loại', to: '/admin/genres', icon: Shapes },
  { label: 'Báo cáo thống kê', to: '/admin/reports', icon: FileClock },
  { label: 'Tài khoản & thẻ', to: '/admin/accounts', icon: UserCog, roles: ['Admin'] },
  { label: 'Tham số hệ thống', to: '/admin/settings', icon: Settings, roles: ['Admin'] },
  { label: 'Nhật ký hệ thống', to: '/admin/logs', icon: FileClock, roles: ['Admin'] },
]

export function visibleNav(items: NavItem[], role: TenVaiTro | null): NavItem[] {
  return items.filter((item) => !item.roles || (role && item.roles.includes(role)))
}
