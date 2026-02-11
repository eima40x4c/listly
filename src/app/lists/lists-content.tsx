'use client';

import { Plus, Search } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { ListCard } from '@/components/features/lists/ListCard';
import { ShoppingListForm } from '@/components/features/lists/ShoppingListForm';
import { Container, Header } from '@/components/layout';
import { Button, Input, Skeleton } from '@/components/ui';
import { ErrorMessage } from '@/components/ui';
import { useLists } from '@/hooks/api/useLists';

import { EmptyListsState } from './empty-lists-state';

export function ListsContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, _setFilterStatus] = useState<
    'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'all'
  >('ACTIVE');
  const [showCreateModal, setShowCreateModal] = useState(false);

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
    if (!listsResponse?.data) return [];

    const lists = listsResponse.data;

    if (!searchQuery.trim()) return lists;

    const query = searchQuery.toLowerCase();
    return lists.filter(
      (list) =>
        list.name.toLowerCase().includes(query) ||
        list.description?.toLowerCase().includes(query)
    );
  }, [listsResponse?.data, searchQuery]);

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
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <Container className="flex flex-1 items-center justify-center py-12">
          <ErrorMessage error={error as Error} retry={refetch} />
        </Container>
      </div>
    );
  }

  // Empty state (no lists at all)
  const hasNoLists =
    !isLoading &&
    regularLists.length === 0 &&
    templateLists.length === 0 &&
    !searchQuery;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <Header />

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
      <main className="flex-1 pb-20">
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
                    {/* Filter controls can be added here */}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {isLoading ? (
                      // Loading skeletons
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
                    <h3 className="mb-2 text-lg font-semibold">
                      No lists found
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Try searching with different keywords
                    </p>
                  </div>
                )}
            </>
          )}
        </Container>
      </main>

      {/* Floating Action Button */}
      {!hasNoLists && (
        <Button
          size="lg"
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg sm:bottom-6"
          onClick={() => setShowCreateModal(true)}
          aria-label="Create new list"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Create List Modal */}
      {showCreateModal && (
        <ShoppingListForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
