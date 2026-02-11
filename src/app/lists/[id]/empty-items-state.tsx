import { ShoppingCart } from 'lucide-react';

export function EmptyItemsState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="mb-2 text-lg font-semibold">No items yet</h3>

      <p className="text-sm text-muted-foreground">
        Add items using the input above
      </p>
    </div>
  );
}
