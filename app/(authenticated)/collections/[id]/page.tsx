import { CollectionDetailClient } from "./collection-detail-client";

interface CollectionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CollectionDetailPage({
  params,
}: CollectionDetailPageProps) {
  const { id } = await params;

  return <CollectionDetailClient collectionId={id} />;
}
