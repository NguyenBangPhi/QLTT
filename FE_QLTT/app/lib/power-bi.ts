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
    key: 'theo-the-loai',
    label: 'Lượt mượn theo thể loại',
    title: 'DA-SoLuotMuonTheoTheLoaiSach',
    src: embedUrl('a1caab54-ab55-482d-8d35-76f9c665ab56'),
  },
  {
    key: 'giua-cac-khoa',
    label: 'Mượn trả giữa các khoa',
    title: 'DA-TinhTrangMuonTraGiuaCacKhoa',
    src: embedUrl('e10a6310-daf2-44a8-8387-d89145e24ec3'),
  },
  {
    key: 'xu-huong-thoi-gian',
    label: 'Xu hướng mượn theo thời gian',
    title: 'DA-XuHuongSoLuotMuonTheoThoiGian',
    src: embedUrl('131e9e7f-4fbc-4f49-844b-83e91327d560'),
  },
]
