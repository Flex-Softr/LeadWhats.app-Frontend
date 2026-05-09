export type PhoneCountryPrefix = {
  iso2: string;
  name: string;
  dialCode: string;
};

export const PHONE_COUNTRY_PREFIXES: PhoneCountryPrefix[] = [
  { iso2: "US", name: "United States", dialCode: "+1" },
  { iso2: "CA", name: "Canada", dialCode: "+1" },
  { iso2: "GB", name: "United Kingdom", dialCode: "+44" },
  { iso2: "AU", name: "Australia", dialCode: "+61" },
  { iso2: "NZ", name: "New Zealand", dialCode: "+64" },
  { iso2: "IN", name: "India", dialCode: "+91" },
  { iso2: "PK", name: "Pakistan", dialCode: "+92" },
  { iso2: "BD", name: "Bangladesh", dialCode: "+880" },
  { iso2: "AE", name: "United Arab Emirates", dialCode: "+971" },
  { iso2: "SA", name: "Saudi Arabia", dialCode: "+966" },
  { iso2: "QA", name: "Qatar", dialCode: "+974" },
  { iso2: "KW", name: "Kuwait", dialCode: "+965" },
  { iso2: "OM", name: "Oman", dialCode: "+968" },
  { iso2: "DE", name: "Germany", dialCode: "+49" },
  { iso2: "FR", name: "France", dialCode: "+33" },
  { iso2: "IT", name: "Italy", dialCode: "+39" },
  { iso2: "ES", name: "Spain", dialCode: "+34" },
  { iso2: "NL", name: "Netherlands", dialCode: "+31" },
  { iso2: "SE", name: "Sweden", dialCode: "+46" },
  { iso2: "NO", name: "Norway", dialCode: "+47" },
  { iso2: "DK", name: "Denmark", dialCode: "+45" },
  { iso2: "CH", name: "Switzerland", dialCode: "+41" },
  { iso2: "TR", name: "Turkey", dialCode: "+90" },
  { iso2: "BR", name: "Brazil", dialCode: "+55" },
  { iso2: "MX", name: "Mexico", dialCode: "+52" },
  { iso2: "AR", name: "Argentina", dialCode: "+54" },
  { iso2: "ZA", name: "South Africa", dialCode: "+27" },
  { iso2: "NG", name: "Nigeria", dialCode: "+234" },
  { iso2: "KE", name: "Kenya", dialCode: "+254" },
  { iso2: "EG", name: "Egypt", dialCode: "+20" },
  { iso2: "ID", name: "Indonesia", dialCode: "+62" },
  { iso2: "MY", name: "Malaysia", dialCode: "+60" },
  { iso2: "SG", name: "Singapore", dialCode: "+65" },
  { iso2: "TH", name: "Thailand", dialCode: "+66" },
  { iso2: "VN", name: "Vietnam", dialCode: "+84" },
  { iso2: "PH", name: "Philippines", dialCode: "+63" },
  { iso2: "CN", name: "China", dialCode: "+86" },
  { iso2: "JP", name: "Japan", dialCode: "+81" },
  { iso2: "KR", name: "South Korea", dialCode: "+82" },
];

export const DEFAULT_PHONE_COUNTRY_ISO2 = "BD";

export function countryIsoToFlag(iso2: string): string {
  return iso2
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 2)
    .split("")
    .map((ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)))
    .join("");
}

export function findCountryByIso2(iso2: string): PhoneCountryPrefix | undefined {
  return PHONE_COUNTRY_PREFIXES.find((item) => item.iso2 === iso2.toUpperCase());
}

export function buildE164Phone(dialCode: string, localNumber: string): string {
  const prefix = dialCode.trim();
  const local = localNumber.replace(/[^\d]/g, "");
  return `${prefix}${local}`;
}

export function splitE164Phone(phone: string): {
  iso2: string;
  localNumber: string;
} {
  const normalized = phone.replace(/\s+/g, "");
  const sorted = [...PHONE_COUNTRY_PREFIXES].sort(
    (a, b) => b.dialCode.length - a.dialCode.length
  );
  const matched = sorted.find((item) => normalized.startsWith(item.dialCode));
  if (!matched) {
    return { iso2: DEFAULT_PHONE_COUNTRY_ISO2, localNumber: normalized.replace(/^\+/, "") };
  }
  return {
    iso2: matched.iso2,
    localNumber: normalized.slice(matched.dialCode.length),
  };
}
