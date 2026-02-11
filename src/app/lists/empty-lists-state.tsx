import { ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui';

interface EmptyListsStateProps {
  onCreateClick: () => void;
}

export function EmptyListsState({ onCreateClick }: EmptyListsStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 rounded-full bg-muted p-6">
        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
      </div>

      <h2 className="mb-2 text-2xl font-bold">No lists yet</h2>

      <p className="mb-6 max-w-sm text-muted-foreground">
        Create your first shopping list to get started with smarter shopping
      </p>

      <Button size="lg" onClick={onCreateClick}>
        Create Your First List
      </Button>
    </div>
  );
}
