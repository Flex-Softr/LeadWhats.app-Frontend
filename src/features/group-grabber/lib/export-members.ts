import type { GroupGrabberExportMembersBody } from "@/types/group-grabber-api";
import { ApiError, apiFetch } from "@/lib/api";

function buildExportFilename(groupName: string, extension: "csv" | "xlsx") {
  const slug =
    groupName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "group-members";
  return `${slug}-members.${extension}`;
}

function filenameFromResponse(res: Response): string | null {
  const header = res.headers.get("Content-Disposition");
  const match = header?.match(/filename="([^"]+)"/);
  return match?.[1] ?? null;
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

async function parseExportError(res: Response): Promise<ApiError> {
  try {
    const body = (await res.json()) as {
      error?: { code?: string; message?: string };
    };
    return new ApiError(
      res.status,
      body.error?.message ?? res.statusText,
      body.error?.code
    );
  } catch {
    return new ApiError(res.status, res.statusText);
  }
}

/** Download CSV/XLSX for already-scraped members via `POST /v1/group-grabber/export-members`. */
export async function downloadGrabbedMembersExport(
  input: GroupGrabberExportMembersBody & { fallbackGroupName: string }
): Promise<void> {
  const res = await apiFetch("/v1/group-grabber/export-members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      format: input.format,
      groupName: input.groupName,
      onlyWithPhone: input.onlyWithPhone,
      members: input.members,
    } satisfies GroupGrabberExportMembersBody),
  });

  if (!res.ok) {
    throw await parseExportError(res);
  }

  const blob = await res.blob();
  downloadBlob(
    blob,
    filenameFromResponse(res) ??
      buildExportFilename(input.fallbackGroupName, input.format)
  );
}
