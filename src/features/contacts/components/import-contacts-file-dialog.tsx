"use client";

import * as React from "react";
import { AlertCircle, FileUp } from "lucide-react";

import {
  buildImportLines,
  countNonEmptyPhones,
  guessColumnMapping,
  parseContactImportFile,
} from "@/features/contacts/lib/import-file-parse";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ImportContactsFileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  onImport: (lines: string[]) => Promise<void>;
};

const PREVIEW_ROWS = 8;
const NONE = "__none__";

function columnLabel(
  rows: string[][],
  colIdx: number,
  hasHeader: boolean
): string {
  const colMark =
    colIdx < 26 ? String.fromCharCode(65 + colIdx) : String(colIdx + 1);
  const header = hasHeader ? rows[0]?.[colIdx]?.trim() : "";
  const sample = rows[hasHeader ? 1 : 0]?.[colIdx]?.trim() ?? "";
  const bit = header
    ? `${header.slice(0, 28)}${header.length > 28 ? "…" : ""}`
    : sample
      ? sample.slice(0, 22) + (sample.length > 22 ? "…" : "")
      : "empty";
  return `Column ${colMark} — ${bit}`;
}

export function ImportContactsFileDialog({
  open,
  onOpenChange,
  groupName,
  onImport,
}: ImportContactsFileDialogProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [parseError, setParseError] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<string[][] | null>(null);
  const [firstRowIsHeader, setFirstRowIsHeader] = React.useState(true);
  const [phoneCol, setPhoneCol] = React.useState(0);
  const [nameCol, setNameCol] = React.useState<string>(NONE);

  const resetState = React.useCallback(() => {
    setBusy(false);
    setParseError(null);
    setFileName(null);
    setRows(null);
    setFirstRowIsHeader(true);
    setPhoneCol(0);
    setNameCol(NONE);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  React.useEffect(() => {
    if (open) resetState();
  }, [open, resetState]);

  const maxCols = rows ? Math.max(1, ...rows.map((r) => r.length)) : 0;

  const colIndices = React.useMemo(
    () => Array.from({ length: maxCols }, (_, i) => i),
    [maxCols]
  );

  const previewSlice = React.useMemo(() => {
    if (!rows) return [];
    return rows.slice(0, PREVIEW_ROWS);
  }, [rows]);

  const importCount = React.useMemo(() => {
    if (!rows) return 0;
    return countNonEmptyPhones(rows, {
      firstRowIsHeader,
      phoneCol,
    });
  }, [rows, firstRowIsHeader, phoneCol]);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError(null);
    setBusy(true);
    try {
      const result = await parseContactImportFile(file);
      if (!result.ok) {
        setParseError(result.error);
        setRows(null);
        return;
      }
      const { rows: data } = result.data;
      const guess = guessColumnMapping(data);
      setRows(data);
      setFirstRowIsHeader(guess.firstRowIsHeader);
      const colCount = Math.max(1, ...data.map((r) => r.length));
      setPhoneCol(Math.min(Math.max(0, guess.phoneCol), colCount - 1));
      setNameCol(
        guess.nameCol !== null && guess.nameCol >= 0
          ? String(guess.nameCol)
          : NONE
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleImport() {
    if (!rows || importCount === 0) return;
    const lines = buildImportLines(rows, {
      firstRowIsHeader,
      phoneCol,
      nameCol: nameCol === NONE ? null : Number(nameCol),
    });
    if (lines.length === 0) return;
    setBusy(true);
    try {
      await onImport(lines);
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  const mappingStep = rows !== null && parseError === null;

  const parseErrorBlock =
    parseError != null ? (
      <div
        className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100"
        role="alert"
      >
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-medium">Could not read this file</p>
          <p className="mt-1 text-amber-900/90 dark:text-amber-100/90">
            {parseError}
          </p>
        </div>
      </div>
    ) : null;

  const mainInner = (
    <>
      <DialogHeader className="text-left sm:text-left">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <FileUp className="size-4" />
          </div>
          <DialogTitle>Import from file</DialogTitle>
        </div>
        <DialogDescription
          className={cn(
            "max-w-none text-pretty leading-relaxed",
            mappingStep && "space-y-2"
          )}
        >
          {mappingStep ? (
            <>
              <span className="block">
                Choose which column is <strong>phone</strong> (required) and
                which is <strong>name</strong> (optional) for{" "}
                <span className="font-medium text-foreground">{groupName}</span>
                .
              </span>
                <span className="block text-muted-foreground">
                  Files: <strong>.xlsx</strong>, <strong>.xls</strong>,{" "}
                  <strong>.csv</strong>, <strong>.txt</strong> (UTF-8). If phones
                  look like <span className="font-mono text-[11px]">…@lid</span>
                  , WhatsApp did not export real numbers — map a column with{" "}
                  <span className="font-mono text-[11px]">…@s.whatsapp.net</span>{" "}
                  or digits with country code.
                </span>
            </>
          ) : (
            <>
              Upload a spreadsheet or CSV into{" "}
              <span className="font-medium">{groupName}</span>. Excel files use
              the <strong>first sheet</strong>. Next step: map columns if
              needed.
            </>
          )}
        </DialogDescription>
      </DialogHeader>

      {parseErrorBlock}

      {!mappingStep ? (
        <div className="space-y-3">
          <Label htmlFor="import-contacts-file" className="sr-only">
            Choose file
          </Label>
          <input
            ref={inputRef}
            id="import-contacts-file"
            type="file"
            accept=".csv,.txt,.xlsx,.xls,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="hidden"
            disabled={busy}
            onChange={(e) => void onPickFile(e)}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? "Reading file…" : "Choose Excel or CSV file"}
          </Button>
          {fileName ? (
            <p className="text-center text-xs text-muted-foreground">
              {fileName}
            </p>
          ) : null}
        </div>
      ) : (
          <div className="min-w-0 space-y-6">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/80 bg-muted/30 p-4 text-sm leading-snug">
              <input
                type="checkbox"
                className="mt-0.5 size-4 shrink-0 rounded border-input"
                checked={firstRowIsHeader}
                onChange={(e) => setFirstRowIsHeader(e.target.checked)}
              />
              <span>
                <span className="font-medium text-foreground">
                  First row contains column headers
                </span>
                <span className="mt-1 block text-muted-foreground">
                  Turn off if the first row is already data.
                </span>
              </span>
            </label>

            <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              <div className="min-w-0 space-y-2">
                <Label htmlFor="import-phone-col">Phone column (required)</Label>
                <Select
                  value={String(phoneCol)}
                  onValueChange={(v) => setPhoneCol(Number(v))}
                >
                  <SelectTrigger
                    id="import-phone-col"
                    className="h-11 w-full min-w-0 max-w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    align="start"
                    alignItemWithTrigger={false}
                    sideOffset={8}
                    className="max-h-64 w-[min(calc(100vw-2rem),32rem)] max-w-[min(calc(100vw-2rem),32rem)]"
                  >
                    {colIndices.map((i) => (
                      <SelectItem key={`p-${i}`} value={String(i)}>
                        {columnLabel(rows!, i, firstRowIsHeader)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-0 space-y-2">
                <Label htmlFor="import-name-col">Name column (optional)</Label>
                <Select
                  value={nameCol}
                  onValueChange={(v) => setNameCol(v ?? NONE)}
                >
                  <SelectTrigger
                    id="import-name-col"
                    className="h-11 w-full min-w-0 max-w-full"
                  >
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent
                    align="start"
                    alignItemWithTrigger={false}
                    sideOffset={8}
                    className="max-h-64 w-[min(calc(100vw-2rem),32rem)] max-w-[min(calc(100vw-2rem),32rem)]"
                  >
                    <SelectItem value={NONE}>None — use “Contact”</SelectItem>
                    {colIndices.map((i) => (
                      <SelectItem key={`n-${i}`} value={String(i)}>
                        {columnLabel(rows!, i, firstRowIsHeader)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="min-w-0 space-y-2">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-end sm:justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Preview (first {PREVIEW_ROWS} rows)
                </p>
                <p className="text-xs text-muted-foreground">
                  Scroll horizontally to see all columns.
                </p>
              </div>
              <div className="min-h-[min(42dvh,320px)] min-w-0 overflow-x-auto overflow-y-auto rounded-lg border bg-card shadow-sm h-[min(58dvh,720px)] max-h-[min(58dvh,720px)]">
                <Table className="w-max min-w-full text-xs">
                  <TableHeader>
                    <TableRow>
                      {colIndices.map((i) => (
                        <TableHead
                          key={i}
                          className="max-w-[220px] whitespace-normal break-words px-3 py-2 text-left align-top"
                        >
                          {firstRowIsHeader
                            ? rows![0]?.[i]?.trim() || `Col ${i + 1}`
                            : `Col ${i + 1}`}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewSlice
                      .slice(firstRowIsHeader ? 1 : 0)
                      .map((row, ri) => (
                        <TableRow key={ri}>
                          {colIndices.map((ci) => (
                            <TableCell
                              key={ci}
                              className="max-w-[220px] whitespace-normal break-words px-3 py-2 align-top text-xs"
                            >
                              {row[ci] ?? ""}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{importCount}</strong> row(s)
              with a value in the phone column will be imported.
            </p>
          </div>
        )}
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          mappingStep
            ? "flex !h-[min(92dvh,900px)] !w-[min(96vw,1200px)] !max-w-[1200px] flex-col gap-0 overflow-hidden rounded-lg border-violet-100 p-0"
            : "!w-[min(92vw,680px)] !max-w-[680px] rounded-lg border-violet-100"
        )}
        showCloseButton
      >
        {mappingStep ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-8 sm:py-6">
              {mainInner}
            </div>
          </div>
        ) : (
          mainInner
        )}

        <DialogFooter
          className={cn(
            "gap-2 sm:gap-0",
            mappingStep &&
              "mx-0 mb-0 mt-0 shrink-0 rounded-none border-t border-violet-100 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/60 sm:px-8"
          )}
        >
          <Button
            type="button"
            variant="secondary"
            className="rounded-md"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Close
          </Button>
          {mappingStep ? (
            <Button
              type="button"
              className="rounded-md bg-violet-600 font-semibold text-white hover:bg-violet-700"
              disabled={busy || importCount === 0}
              onClick={() => void handleImport()}
            >
              {busy ? "Importing..." : `Import ${importCount} contact(s)`}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
