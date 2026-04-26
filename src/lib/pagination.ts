/** 1-based page clamped to [1, totalPages]. */
export function clampPage(page: number, totalPages: number): number {
  const tp = Math.max(1, totalPages);
  return Math.min(Math.max(1, Math.floor(page)), tp);
}

export function getTotalPages(totalItems: number, pageSize: number): number {
  if (totalItems <= 0) return 1;
  const ps = Math.max(1, pageSize);
  return Math.max(1, Math.ceil(totalItems / ps));
}

export type PaginationModelItem =
  | { type: "page"; value: number }
  | { type: "ellipsis"; key: string };

/**
 * Builds page buttons + ellipsis for large page counts (1-based pages).
 */
export function getPaginationModel(
  currentPage: number,
  totalPages: number,
  siblingCount = 1
): PaginationModelItem[] {
  const tp = Math.max(1, totalPages);
  const cp = clampPage(currentPage, tp);

  if (tp <= siblingCount * 2 + 3) {
    return Array.from({ length: tp }, (_, i) => ({
      type: "page" as const,
      value: i + 1,
    }));
  }

  const result: PaginationModelItem[] = [];
  const showLeftEllipsis = cp - siblingCount > 2;
  const showRightEllipsis = cp + siblingCount < tp - 1;

  result.push({ type: "page", value: 1 });

  const start = showLeftEllipsis ? cp - siblingCount : 2;
  const end = showRightEllipsis ? cp + siblingCount : tp - 1;

  if (showLeftEllipsis) {
    result.push({ type: "ellipsis", key: "start" });
  } else {
    for (let p = 2; p < start; p++) {
      result.push({ type: "page", value: p });
    }
  }

  for (let p = start; p <= end; p++) {
    if (p !== 1 && p !== tp) {
      result.push({ type: "page", value: p });
    }
  }

  if (showRightEllipsis) {
    result.push({ type: "ellipsis", key: "end" });
  } else {
    for (let p = end + 1; p < tp; p++) {
      result.push({ type: "page", value: p });
    }
  }

  if (tp > 1) {
    result.push({ type: "page", value: tp });
  }

  return result;
}

/** Inclusive start index (0-based) and exclusive end index for `Array.slice`. */
export function getSliceRange(
  page: number,
  pageSize: number,
  totalItems: number
): { start: number; end: number } {
  const ps = Math.max(1, pageSize);
  const tp = getTotalPages(totalItems, ps);
  const p = clampPage(page, tp);
  const start = (p - 1) * ps;
  const end = Math.min(start + ps, totalItems);
  return { start, end };
}

export function paginateSlice<T>(
  items: readonly T[],
  page: number,
  pageSize: number
): T[] {
  const { start, end } = getSliceRange(page, pageSize, items.length);
  return items.slice(start, end);
}
