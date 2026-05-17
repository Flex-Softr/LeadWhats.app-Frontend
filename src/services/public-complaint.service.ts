import { apiJson } from "@/lib/api";

export type PublicComplaintCategory =
  | "billing"
  | "technical"
  | "account"
  | "abuse"
  | "other";

export type PublicComplaintPayload = {
  email: string;
  name?: string;
  category: PublicComplaintCategory;
  subject: string;
  message: string;
};

export async function submitPublicComplaint(
  payload: PublicComplaintPayload
): Promise<void> {
  await apiJson<void>("/v1/public/complaints", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
