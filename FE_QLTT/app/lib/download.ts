import { ApiError, normalizeApiError } from '~/lib/api-error'

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function normalizeBlobError(err: unknown): Promise<ApiError> {
  const data = (err as { data?: unknown })?.data
  if (data instanceof Blob) {
    try {
      const body = JSON.parse(await data.text()) as { message?: string; statusCode?: number }
      if (body.message) return new ApiError(body.message, body.statusCode ?? 0)
    } catch {
      return normalizeApiError(err)
    }
  }
  return normalizeApiError(err)
}
