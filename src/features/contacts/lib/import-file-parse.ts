import Papa from "papaparse";
import * as XLSX from "xlsx";

import { coercePhoneCellForImport } from "./coerce-import-phone";

export const MAX_IMPORT_ROWS = 20_000;

export type ParsedSheet = {
  rows: string[][];
  fileLabel: string;
};

function normalizeRow(r: unknown[]): string[] {
  return r.map((c) => {
    if (c == null || c === "") return "";
    if (typeof c === "number" && Number.isFinite(c)) {
      return Number.isInteger(c) ? String(c) : String(c);
    }
    return String(c).trim();
  });
}

function trimTrailingEmptyCols(rows: string[][]): string[][] {
  let max = 0;
  for (const row of rows) {
    let last = row.length;
    while (last > 0 && !(row[last - 1]?.trim())) last -= 1;
    max = Math.max(max, last);
  }
  return rows.map((row) => {
    const next = row.slice(0, max);
    while (next.length < max) next.push("");
    return next;
  });
}

export async function parseContactImportFile(file: File): Promise<
  | { ok: true; data: ParsedSheet }
  | { ok: false; error: string }
> {
  const name = file.name.toLowerCase();
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";

  try {
    if (ext === ".xlsx" || ext === ".xls") {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      const sheetName = wb.SheetNames[0];
      if (!sheetName) {
        return { ok: false, error: "The workbook has no sheets." };
      }
      const sheet = wb.Sheets[sheetName];
      if (!sheet) {
        return { ok: false, error: "Could not read the first sheet." };
      }
      const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        header: 1,
        defval: "",
        raw: false,
      }) as unknown[][];
      const rows = trimTrailingEmptyCols(
        raw
          .map((row) =>
            normalizeRow(Array.isArray(row) ? row : [row as unknown])
          )
          .filter((row) => row.some((c) => c.length > 0))
      );
      if (rows.length === 0) {
        return { ok: false, error: "No rows found in the first sheet." };
      }
      if (rows.length > MAX_IMPORT_ROWS) {
        return {
          ok: false,
          error: `This file has more than ${MAX_IMPORT_ROWS.toLocaleString()} rows. Split or trim the sheet first.`,
        };
      }
      return { ok: true, data: { rows, fileLabel: file.name } };
    }

    const text = await file.text();
    const parsed = Papa.parse<string[]>(text, {
      skipEmptyLines: "greedy",
      quoteChar: '"',
      escapeChar: '"',
    });
    const fatal = parsed.errors.find((e) => e.type === "Quotes");
    if (fatal) {
      return {
        ok: false,
        error: `CSV parse issue (row ${fatal.row ?? "?"}): ${fatal.message}. Try exporting as UTF-8 CSV.`,
      };
    }
    const data = trimTrailingEmptyCols(
      (parsed.data as unknown[])
        .filter((row): row is unknown[] => Array.isArray(row))
        .map((row) => normalizeRow(row))
        .filter((row) => row.some((c) => c.length > 0))
    );

    if (data.length === 0) {
      return {
        ok: false,
        error:
          "No rows found. Try Excel (.xlsx), or save CSV as UTF-8 with commas or semicolons.",
      };
    }
    if (data.length > MAX_IMPORT_ROWS) {
      return {
        ok: false,
        error: `More than ${MAX_IMPORT_ROWS.toLocaleString()} rows. Split the file first.`,
      };
    }
    return { ok: true, data: { rows: data, fileLabel: file.name } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `Could not read file: ${msg}` };
  }
}

const PHONE_HEADER =
  /phone|mobile|celular|whatsapp|tel|cell|móvil|telefono|telefone|handphone|hp|no\.?\s*telp/i;
const NAME_HEADER =
  /name|nombre|nom|contact|customer|full\s*name|first\s*name|last\s*name|display/i;

export function guessColumnMapping(rows: string[][]): {
  firstRowIsHeader: boolean;
  nameCol: number | null;
  phoneCol: number;
} {
  if (rows.length === 0) {
    return { firstRowIsHeader: false, nameCol: null, phoneCol: 0 };
  }
  const maxCol = Math.max(1, ...rows.map((r) => r.length));
  const r0 = rows[0].map((c) => c.trim());

  const looksLikeHeader = r0.some(
    (c) => PHONE_HEADER.test(c) || NAME_HEADER.test(c)
  );

  const firstRowIsHeader = looksLikeHeader;
  const headerRow = firstRowIsHeader ? r0 : null;
  const start = firstRowIsHeader ? 1 : 0;

  let phoneCol = 0;
  let nameCol: number | null = null;

  if (headerRow) {
    let pc = -1;
    let nc = -1;
    for (let i = 0; i < headerRow.length; i++) {
      const h = headerRow[i] ?? "";
      if (PHONE_HEADER.test(h) && pc < 0) pc = i;
      if (NAME_HEADER.test(h) && nc < 0) nc = i;
    }
    phoneCol = pc >= 0 ? pc : guessPhoneColumnIndex(rows, start, maxCol);
    if (nc >= 0 && nc !== phoneCol) nameCol = nc;
    else nameCol = findNameColFallback(phoneCol, maxCol);
  } else {
    phoneCol = guessPhoneColumnIndex(rows, 0, maxCol);
    nameCol = findNameColFallback(phoneCol, maxCol);
  }

  if (nameCol === phoneCol) {
    nameCol = findNameColFallback(phoneCol, maxCol);
  }

  return { firstRowIsHeader, nameCol, phoneCol };
}

function findNameColFallback(phoneCol: number, maxCol: number): number | null {
  if (maxCol <= 1) return null;
  for (let i = 0; i < maxCol; i++) {
    if (i !== phoneCol) return i;
  }
  return null;
}

function guessPhoneColumnIndex(
  rows: string[][],
  start: number,
  maxCol: number
): number {
  let best = 0;
  let bestScore = -1;
  for (let c = 0; c < maxCol; c++) {
    let score = 0;
    const end = Math.min(rows.length, start + 60);
    for (let r = start; r < end; r++) {
      score += scorePhoneCell(rows[r]?.[c] ?? "");
    }
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

function scorePhoneCell(s: string): number {
  const t = s.trim();
  if (!t) return 0;
  const d = t.replace(/\D/g, "");
  if (d.length >= 10 && d.length <= 15) return 4;
  if (d.length >= 8) return 3;
  if (t.startsWith("+") && d.length >= 8) return 3;
  if (d.length >= 6) return 1;
  return 0;
}

export function buildImportLines(
  rows: string[][],
  opts: {
    firstRowIsHeader: boolean;
    nameCol: number | null;
    phoneCol: number;
  }
): string[] {
  const start = opts.firstRowIsHeader ? 1 : 0;
  const lines: string[] = [];
  for (let i = start; i < rows.length; i++) {
    const row = rows[i];
    const rawPhone = (row[opts.phoneCol] ?? "").trim();
    if (!rawPhone) continue;
    const phone = coercePhoneCellForImport(rawPhone);
    if (!phone) continue;
    let name = "Contact";
    if (opts.nameCol !== null && opts.nameCol >= 0) {
      const n = (row[opts.nameCol] ?? "").trim();
      if (n) name = n;
    }
    lines.push(`${name}\t${phone}`);
  }
  return lines;
}

export function countNonEmptyPhones(
  rows: string[][],
  opts: {
    firstRowIsHeader: boolean;
    phoneCol: number;
  }
): number {
  const start = opts.firstRowIsHeader ? 1 : 0;
  let n = 0;
  for (let i = start; i < rows.length; i++) {
    if ((rows[i]?.[opts.phoneCol] ?? "").trim()) n += 1;
  }
  return n;
}
