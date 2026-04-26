"use client";

import * as React from "react";
import {
  clampPage,
  getPaginationModel,
  getSliceRange,
  getTotalPages,
  paginateSlice,
  type PaginationModelItem,
} from "@/lib/pagination";

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export type UsePaginationOptions = {
  /** Total rows (after client-side filters, or server total in controlled mode). */
  totalItems: number;
  initialPage?: number;
  initialPageSize?: number;
  /** Sibling pages on each side of current (default 1). */
  siblingCount?: number;
  pageSizeOptions?: readonly number[];
};

export type UsePaginationResult = {
  /** 1-based */
  page: number;
  setPage: (page: number | ((prev: number) => number)) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  pageSizeOptions: readonly number[];
  totalPages: number;
  totalItems: number;
  /** 0-based inclusive */
  startIndex: number;
  /** 0-based exclusive (for slice) */
  endIndex: number;
  model: PaginationModelItem[];
  goToFirst: () => void;
  goToPrev: () => void;
  goToNext: () => void;
  goToLast: () => void;
  canPrev: boolean;
  canNext: boolean;
  /** Slice a full array to the current page (client-side tables). */
  slice<T>(items: readonly T[]): T[];
};

export function usePagination({
  totalItems,
  initialPage = 1,
  initialPageSize = 10,
  siblingCount = 1,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: UsePaginationOptions): UsePaginationResult {
  const [page, setPageState] = React.useState(() =>
    clampPage(initialPage, getTotalPages(totalItems, initialPageSize))
  );
  const [pageSize, setPageSizeState] = React.useState(() =>
    pageSizeOptions.includes(initialPageSize as never)
      ? initialPageSize
      : pageSizeOptions[0] ?? 10
  );

  const totalPages = React.useMemo(
    () => getTotalPages(totalItems, pageSize),
    [totalItems, pageSize]
  );

  const safePage = clampPage(page, totalPages);

  React.useEffect(() => {
    if (page !== safePage) {
      setPageState(safePage);
    }
  }, [page, safePage]);

  React.useEffect(() => {
    setPageState((p) => clampPage(p, totalPages));
  }, [totalPages]);

  const setPage = React.useCallback(
    (next: number | ((prev: number) => number)) => {
      setPageState((prev) => {
        const raw = typeof next === "function" ? next(prev) : next;
        return clampPage(raw, totalPages);
      });
    },
    [totalPages]
  );

  const setPageSize = React.useCallback((size: number) => {
    const s = Math.max(1, Math.floor(size));
    setPageSizeState(s);
    setPageState(1);
  }, []);

  const { start, end } = getSliceRange(safePage, pageSize, totalItems);

  const model = React.useMemo(
    () => getPaginationModel(safePage, totalPages, siblingCount),
    [safePage, totalPages, siblingCount]
  );

  const goToFirst = React.useCallback(() => setPageState(1), []);
  const goToLast = React.useCallback(
    () => setPageState(totalPages),
    [totalPages]
  );
  const goToPrev = React.useCallback(
    () => setPageState((p) => clampPage(p - 1, totalPages)),
    [totalPages]
  );
  const goToNext = React.useCallback(
    () => setPageState((p) => clampPage(p + 1, totalPages)),
    [totalPages]
  );

  const slice = React.useCallback(
    <T,>(items: readonly T[]) => paginateSlice(items, safePage, pageSize),
    [safePage, pageSize]
  );

  return {
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    pageSizeOptions,
    totalPages,
    totalItems,
    startIndex: start,
    endIndex: end,
    model,
    goToFirst,
    goToPrev,
    goToNext,
    goToLast,
    canPrev: safePage > 1,
    canNext: safePage < totalPages,
    slice,
  };
}

export type UseControlledPaginationArgs = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  siblingCount?: number;
  pageSizeOptions?: readonly number[];
};

/**
 * Maps URL / React Query state into the same shape as {@link usePagination}
 * so {@link TablePagination} works for server-paginated APIs.
 */
export function useControlledPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  siblingCount = 1,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: UseControlledPaginationArgs): UsePaginationResult {
  const totalPages = React.useMemo(
    () => getTotalPages(totalItems, pageSize),
    [totalItems, pageSize]
  );

  const safePage = clampPage(page, totalPages);
  const { start, end } = getSliceRange(safePage, pageSize, totalItems);

  const model = React.useMemo(
    () => getPaginationModel(safePage, totalPages, siblingCount),
    [safePage, totalPages, siblingCount]
  );

  const setPage = React.useCallback(
    (next: number | ((prev: number) => number)) => {
      const raw = typeof next === "function" ? next(safePage) : next;
      onPageChange(clampPage(raw, totalPages));
    },
    [onPageChange, safePage, totalPages]
  );

  const setPageSize = React.useCallback(
    (size: number) => {
      onPageSizeChange?.(Math.max(1, Math.floor(size)));
      onPageChange(1);
    },
    [onPageChange, onPageSizeChange]
  );

  const goToFirst = React.useCallback(() => onPageChange(1), [onPageChange]);
  const goToLast = React.useCallback(
    () => onPageChange(totalPages),
    [onPageChange, totalPages]
  );
  const goToPrev = React.useCallback(
    () => onPageChange(clampPage(safePage - 1, totalPages)),
    [onPageChange, safePage, totalPages]
  );
  const goToNext = React.useCallback(
    () => onPageChange(clampPage(safePage + 1, totalPages)),
    [onPageChange, safePage, totalPages]
  );

  const slice = React.useCallback(
    <T,>(items: readonly T[]) => paginateSlice(items, safePage, pageSize),
    [safePage, pageSize]
  );

  return {
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    pageSizeOptions,
    totalPages,
    totalItems,
    startIndex: start,
    endIndex: end,
    model,
    goToFirst,
    goToPrev,
    goToNext,
    goToLast,
    canPrev: safePage > 1,
    canNext: safePage < totalPages,
    slice,
  };
}
