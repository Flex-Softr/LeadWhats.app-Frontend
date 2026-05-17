import { GroupDetailClient } from "@/features/contacts/components/group-detail-client";

type PageProps = {
  params: Promise<{ groupId: string }>;
};

export default async function ContactGroupPage({ params }: PageProps) {
  const { groupId } = await params;
  return <GroupDetailClient groupId={groupId} />;
}
