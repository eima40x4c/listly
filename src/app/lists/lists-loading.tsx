'use client';

import { useSession } from 'next-auth/react';

import { Container, Header } from '@/components/layout';
import { Skeleton } from '@/components/ui';

export function ListsLoading() {
  const { data: session } = useSession();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <Header user={session?.user} />

      {/* Search Bar Skeleton */}
      <div className="sticky top-14 z-10 border-b bg-background/95 backdrop-blur">
        <Container className="py-4">
          <Skeleton className="h-10 w-full rounded-lg" />
        </Container>
      </div>

      {/* Content Skeletons */}
      <main className="flex-1 pb-20">
        <Container className="py-6">
          {/* Section Header */}
          <div className="mb-4">
            <Skeleton className="h-5 w-24" />
          </div>

          {/* List Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3 rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-6 w-6 rounded" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </main>
    </div>
  );
}
