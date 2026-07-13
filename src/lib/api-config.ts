export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;

  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is missing during the frontend build."
    );
  }

  return url.replace(/\/$/, "");
}