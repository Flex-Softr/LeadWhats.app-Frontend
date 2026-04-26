"use client";

/**
 * Full-featured table footer: summary, page size, first/prev/numbered/ellipsis/next/last, go-to page.
 *
 * Client-side: `const p = usePagination({ totalItems: rows.length });` then `p.slice(rows)` + `<TablePagination {...p} />`.
 * Server-side: `useControlledPagination({ page, pageSize, totalItems, onPageChange, onPageSizeChange })` + same bar.
 */

import * as React from "react";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { UsePaginationResult } from "@/hooks/use-pagination";

export type TablePaginationProps = UsePaginationResult & {
  className?: string;
  disabled?: boolean;
  /** Rows-per-page select (default true). */
  showPageSize?: boolean;
  /** First / last page buttons (default true). */
  showEdges?: boolean;
  /** "Go to page" input (default true). */
  showPageJump?: boolean;
  /** "Showing x–y of z" (default true). */
  showSummary?: boolean;
  /** Hide numeric page buttons on very small screens (default true). */
  collapsePagesOnMobile?: boolean;
};

export function TablePagination({
  className,
  disabled,
  showPageSize = true,
  showEdges = true,
  showPageJump = true,
  showSummary = true,
  collapsePagesOnMobile = true,
  page,
  setPage,
  pageSize,
  setPageSize,
  pageSizeOptions,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  model,
  goToFirst,
  goToLast,
  goToPrev,
  goToNext,
  canPrev,
  canNext,
}: TablePaginationProps) {
  const [jumpValue, setJumpValue] = React.useState(String(page));

  React.useEffect(() => {
    setJumpValue(String(page));
  }, [page]);

  const applyJump = React.useCallback(() => {
    const n = parseInt(jumpValue, 10);
    if (!Number.isFinite(n)) {
      setJumpValue(String(page));
      return;
    }
    setPage(n);
  }, [jumpValue, page, setPage]);

  const summary =
    totalItems === 0
      ? "No rows"
      : `Showing ${startIndex + 1}–${endIndex} of ${totalItems}`;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-2 sm:px-5 sm:py-3.5",
        className
      )}
      role="navigation"
      aria-label="Table pagination"
    >
      {showSummary && (
        <p className="order-1 text-sm tabular-nums text-muted-foreground sm:order-none">
          {summary}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 sm:gap-1.5">
        {showPageSize && (
          <div className="mr-1 flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Rows
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => v && setPageSize(Number(v))}
              disabled={disabled || totalItems === 0}
            >
              <SelectTrigger size="sm" className="h-8 w-[4.5rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-0.5">
          {showEdges && (
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              className="shrink-0"
              aria-label="First page"
              disabled={disabled || !canPrev}
              onClick={goToFirst}
            >
              <ChevronsLeft className="size-3.5" />
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            className="shrink-0"
            aria-label="Previous page"
            disabled={disabled || !canPrev}
            onClick={goToPrev}
          >
            <ChevronLeft className="size-3.5" />
          </Button>

          <div
            className={cn(
              "mx-0.5 flex items-center gap-0.5",
              collapsePagesOnMobile && "hidden min-[420px]:flex"
            )}
          >
            {model.map((item) =>
              item.type === "ellipsis" ? (
                <span
                  key={item.key}
                  className="flex size-8 items-center justify-center text-muted-foreground"
                  aria-hidden
                >
                  …
                </span>
              ) : (
                <Button
                  key={item.value}
                  type="button"
                  variant={item.value === page ? "default" : "outline"}
                  size="icon-xs"
                  className="size-8 min-w-8"
                  aria-label={`Page ${item.value}`}
                  aria-current={item.value === page ? "page" : undefined}
                  disabled={disabled || totalItems === 0}
                  onClick={() => setPage(item.value)}
                >
                  <span className="tabular-nums">{item.value}</span>
                </Button>
              )
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            className="shrink-0"
            aria-label="Next page"
            disabled={disabled || !canNext}
            onClick={goToNext}
          >
            <ChevronRight className="size-3.5" />
          </Button>
          {showEdges && (
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              className="shrink-0"
              aria-label="Last page"
              disabled={disabled || !canNext}
              onClick={goToLast}
            >
              <ChevronsRight className="size-3.5" />
            </Button>
          )}
        </div>

        {showPageJump && totalPages > 1 && (
          <div className="ml-1 flex items-center gap-1.5">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Go to
            </span>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label="Go to page"
              disabled={disabled || totalItems === 0}
              className="h-8 w-12 px-1.5 text-center tabular-nums"
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value.replace(/\D/g, ""))}
              onBlur={applyJump}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyJump();
                }
              }}
            />
            <span className="text-xs tabular-nums text-muted-foreground">
              / {totalPages}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 px-2 text-xs"
              disabled={disabled || totalItems === 0}
              onClick={applyJump}
            >
              Go
            </Button>
          </div>
        )}
      </div>

      {collapsePagesOnMobile && totalPages > 1 && (
        <p className="min-[420px]:hidden text-center text-xs tabular-nums text-muted-foreground">
          Page {page} of {totalPages}
        </p>
      )}
    </div>
  );
}
