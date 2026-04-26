import type { PageMeta, PagePath } from "@/config/pages";
import { PAGE_META } from "@/config/pages";
import { FeaturePlaceholder } from "@/features/shared/components/feature-placeholder";

export function buildPlaceholderPage(
  path: Exclude<
    PagePath,
    "/" | "/devices" | "/templates" | "/contacts" | "/single-message"
  >
) {
  const meta: PageMeta = PAGE_META[path];

  function PlaceholderPage() {
    return (
      <FeaturePlaceholder title={meta.title} description={meta.description} />
    );
  }

  return PlaceholderPage;
}
