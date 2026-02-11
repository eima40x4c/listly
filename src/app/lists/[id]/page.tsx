import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import ListDetailContent from './list-detail-content';
import { ListDetailSkeleton } from './list-detail-skeleton';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Metadata generation
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  // In production, we'd fetch the list here for metadata
  // For now, return generic metadata
  return {
    title: `List ${id} | Listly`,
    description: 'Manage your shopping list items',
  };
}

// Page component
export default async function ListDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Validate ID format (basic check)
  if (!id || id.length === 0) {
    notFound();
  }

  return (
    <Suspense fallback={<ListDetailSkeleton />}>
      <ListDetailContent listId={id} />
    </Suspense>
  );
}
