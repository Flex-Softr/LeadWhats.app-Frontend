/** Align with server `sanitizePhoneRawInput` for WhatsApp / Excel exports. */

const PHONE_VALUE_SPLIT = /[,،;\uFF0C\uFF1B|\r\n]+/u;

export function coercePhoneCellForImport(raw: string): string {
  let s = raw.normalize("NFC").trim();
  if (PHONE_VALUE_SPLIT.test(s)) {
    const first = s.split(PHONE_VALUE_SPLIT).map((p) => p.trim()).find(Boolean);
    if (first) s = first;
  }

  const waMe = s.match(
    /(?:https?:\/\/)?(?:www\.)?wa\.me\/\+?(\d{6,18})(?:[/?#]|$)/i
  );
  if (waMe) {
    return `+${waMe[1]}`;
  }

  const waPn = s.match(/^\+?(\d{6,18})(?::\d+)?@s\.whatsapp\.net$/i);
  if (waPn) {
    return `+${waPn[1]}`;
  }
  const legacyUs = s.match(/^(\d{6,18})@c\.us$/i);
  if (legacyUs) {
    return `+${legacyUs[1]}`;
  }

  const apiPhone = s.match(/[?&]phone=\+?(\d{6,18})\b/i);
  if (apiPhone && /whatsapp\.com/i.test(s)) {
    return `+${apiPhone[1]}`;
  }

  const intOnlyFloat = s.match(/^(\d+)\.0+$/);
  if (intOnlyFloat) {
    s = intOnlyFloat[1] ?? s;
  }

  if (/[eE][+-]?\d+$/.test(s.replace(/\s/g, ""))) {
    const n = Number(s.replace(/\s/g, ""));
    if (Number.isFinite(n) && n >= 1e7 && n < 1e16) {
      s = String(Math.round(n));
    }
  }

  return s;
}
