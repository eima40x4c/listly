import { Container } from '@/components/layout';
import { Skeleton } from '@/components/ui';

export function ListDetailSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header Skeleton */}
      <div className="flex h-14 items-center gap-4 border-b px-4">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-6 w-40" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>

      {/* Input Skeleton */}
      <div className="sticky top-14 z-10 border-b bg-background p-4">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      {/* Mode Toggle Skeleton */}
      <div className="border-b bg-background p-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* Content Skeletons */}
      <Container className="py-4">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
