export const TEMPLATE_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "marketing", label: "Marketing" },
  { value: "transactional", label: "Transactional" },
  { value: "utility", label: "Utility" },
] as const;

export type TemplateCategoryValue =
  (typeof TEMPLATE_CATEGORIES)[number]["value"];

export function templateCategoryLabel(value: string): string {
  return (
    TEMPLATE_CATEGORIES.find((c) => c.value === value)?.label ?? value
  );
}
