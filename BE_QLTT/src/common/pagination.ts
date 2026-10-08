export const MAX_PAGE_SIZE = 100;

export function clampPaging(page?: number, limit?: number) {
  const safePage = Number.isFinite(page) && (page as number) >= 1 ? Math.floor(page as number) : 1;
  const safeLimit = Number.isFinite(limit)
    ? Math.min(Math.max(Math.floor(limit as number), 1), MAX_PAGE_SIZE)
    : 50;

  return { page: safePage, limit: safeLimit, offset: (safePage - 1) * safeLimit };
}
