import * as XLSX from "xlsx";

/** Matches server export / import mapping: Name, Phone, Status. */
export type ContactImportDemoRow = {
  Name: string;
  Phone: string;
  Status: "verified" | "unverified" | "invalid";
};

const DEMO_HEADERS = ["Name", "Phone", "Status"] as const;

/** Sample rows showing the full import/export schema. */
export const CONTACT_IMPORT_DEMO_ROWS: ContactImportDemoRow[] = [
  {
    Name: "Ada Lovelace",
    Phone: "+14155550100",
    Status: "verified",
  },
  {
    Name: "Grace Hopper",
    Phone: "+14155550101",
    Status: "unverified",
  },
  {
    Name: "Alan Turing",
    Phone: "+14155550102",
    Status: "invalid",
  },
];

function escapeCsvCell(value: string): string {
  const normalized = value.replace(/\r?\n/g, " ");
  return /[",\n]/.test(normalized)
    ? `"${normalized.replace(/"/g, '""')}"`
    : normalized;
}

function recordsToCsv(records: ContactImportDemoRow[]): string {
  return [
    [...DEMO_HEADERS],
    ...records.map((r) => DEMO_HEADERS.map((h) => r[h])),
  ]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Download a sample CSV with Name, Phone, Status columns. */
export function downloadContactImportDemoCsv(): void {
  const csv = recordsToCsv(CONTACT_IMPORT_DEMO_ROWS);
  downloadBlob(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
    "contacts-import-demo.csv"
  );
}

/** Download a sample XLSX with Name, Phone, Status columns. */
export function downloadContactImportDemoXlsx(): void {
  const worksheet = XLSX.utils.json_to_sheet(CONTACT_IMPORT_DEMO_ROWS, {
    header: [...DEMO_HEADERS],
  });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");
  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  }) as ArrayBuffer;
  downloadBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    "contacts-import-demo.xlsx"
  );
}
