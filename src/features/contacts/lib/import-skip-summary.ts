export function ellipsize(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1))}…`;
}

export function formatSkippedSummary(
  skipped: { phone: string; reason: string }[],
  maxInline = 12
): string {
  if (skipped.length === 0) return "";
  if (skipped.length <= maxInline) {
    return skipped
      .map((s) => `${ellipsize(s.phone, 40)}: ${s.reason}`)
      .join("\n");
  }
  const counts = new Map<string, number>();
  for (const s of skipped) {
    counts.set(s.reason, (counts.get(s.reason) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const lines = top.map(([reason, n]) => `• ${n}× ${reason}`).join("\n");
  const samples = skipped
    .slice(0, 4)
    .map((s) => ellipsize(s.phone, 36))
    .join(", ");
  return `${lines}\nSample values: ${samples}`;
}
