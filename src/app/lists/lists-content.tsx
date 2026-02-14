'use client';

import { Plus, Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { CreateListModal } from '@/components/features/lists/CreateListModal';
import { ListCard } from '@/components/features/lists/ListCard';
import { AppShell } from '@/components/layout';
import { Container } from '@/components/layout/Container';
import { Button, Input, Skeleton } from '@/components/ui';
import { ErrorMessage } from '@/components/ui';
import { useLists } from '@/hooks/api/useLists';

import { EmptyListsState } from './empty-lists-state';

export function ListsContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, _setFilterStatus] = useState<
    'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'all'
  >('ACTIVE');
  const searchParams = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Auto-open create modal when ?createList=true (from onboarding CTA)
  useEffect(() => {
    if (searchParams.get('createList') === 'true') {
      setShowCreateModal(true);
      // Clean URL without reloading
      window.history.replaceState({}, '', '/lists');
    }
  }, [searchParams]);

  // Fetch lists
  const {
    data: listsResponse,
    isLoading,
    error,
    refetch,
  } = useLists({
    status: filterStatus === 'all' ? undefined : filterStatus,
  });

  // Filter lists by search query (client-side)
  const filteredLists = useMemo(() => {
    if (!listsResponse) return [];

    const lists = listsResponse;

    if (!searchQuery.trim()) return lists;

    const query = searchQuery.toLowerCase();
    return lists.filter(
      (list) =>
        list.name.toLowerCase().includes(query) ||
        list.description?.toLowerCase().includes(query)
    );
  }, [listsResponse, searchQuery]);

  // Separate templates from regular lists
  const { regularLists, templateLists } = useMemo(() => {
    return filteredLists.reduce(
      (acc, list) => {
        if (list.isTemplate) {
          acc.templateLists.push(list);
        } else {
          acc.regularLists.push(list);
        }
        return acc;
      },
      {
        regularLists: [] as typeof filteredLists,
        templateLists: [] as typeof filteredLists,
      }
    );
  }, [filteredLists]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    setShowCreateModal(false);
    refetch();
  }, [refetch]);

  // Error state
  if (error) {
    return (
      <AppShell>
        <Container className="flex flex-1 items-center justify-center py-12">
          <ErrorMessage error={error as Error} retry={refetch} />
        </Container>
      </AppShell>
    );
  }

  // Empty state (no lists at all)
  const hasNoLists =
    !isLoading &&
    regularLists.length === 0 &&
    templateLists.length === 0 &&
    !searchQuery;

  return (
    <AppShell>
      {/* Search Bar */}
      <div className="sticky top-14 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Container className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search lists..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-9"
            />
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-6">
        {hasNoLists ? (
          <EmptyListsState onCreateClick={() => setShowCreateModal(true)} />
        ) : (
          <>
            {/* My Lists Section */}
            {regularLists.length > 0 && (
              <section className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    My Lists
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {isLoading ? (
                    <>
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-lg" />
                      ))}
                    </>
                  ) : (
                    regularLists.map((list) => (
                      <ListCard key={list.id} list={list} />
                    ))
                  )}
                </div>
              </section>
            )}

            {/* Templates Section */}
            {templateLists.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Templates
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {templateLists.map((list) => (
                    <ListCard key={list.id} list={list} />
                  ))}
                </div>
              </section>
            )}

            {/* No results from search */}
            {!isLoading &&
              regularLists.length === 0 &&
              templateLists.length === 0 &&
              searchQuery && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No lists found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try searching with different keywords
                  </p>
                </div>
              )}
          </>
        )}
      </Container>

      {/* Floating Action Button — positioned above BottomNav on mobile */}
      {!hasNoLists && (
        <Button
          size="lg"
          className="fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full shadow-lg md:bottom-6"
          onClick={() => setShowCreateModal(true)}
          aria-label="Create new list"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Create List Modal */}
      <CreateListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </AppShell>
  );
}
