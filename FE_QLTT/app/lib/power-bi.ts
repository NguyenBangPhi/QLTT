export interface PowerBiReport {
  key: string
  label: string
  title: string
  src: string
}

const TENANT_ID = '2dff09ac-2b3b-4182-9953-2b548e0d0b39'

function embedUrl(reportId: string) {
  return `https://app.powerbi.com/reportEmbed?reportId=${reportId}&autoAuth=true&ctid=${TENANT_ID}`
}

export const POWER_BI_WIDTH = 1140
export const POWER_BI_HEIGHT = 541.25

export const powerBiReports: PowerBiReport[] = [
  {
    key: 'nguoi-muon',
    label: 'Chi tiết người mượn sách',
    title: 'ChiTietNguoiMuonSach',
    src: embedUrl('b2984105-82a2-4f7d-9e2b-6fce3a2bdb8c'),
  },
  {
    key: 'phat-qua-han',
    label: 'Danh sách phạt và quá hạn',
    title: 'DanhSachPhatVaQuaHan',
    src: embedUrl('721954be-d865-4508-b097-ad2f8bc57f00'),
  },
  {
    key: 'do-hot',
    label: 'Đo lường độ HOT của sách',
    title: 'DoLuongDoHotCuaSach',
    src: embedUrl('1486c80b-c114-4e91-923b-3ed1251e785e'),
  },
]
