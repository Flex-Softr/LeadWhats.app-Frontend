import { BulkCampaignDetailPageClient } from "@/features/bulk-messages/components/bulk-campaign-detail-page-client";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BulkCampaignDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <BulkCampaignDetailPageClient campaignId={id} />;
}
