import { Suspense } from 'react';

import { ListsContent } from './lists-content';
import { ListsLoading } from './lists-loading';

export const metadata = {
  title: 'My Lists | Listly',
  description: 'Manage your shopping lists',
};

export default function ListsPage() {
  return (
    <Suspense fallback={<ListsLoading />}>
      <ListsContent />
    </Suspense>
  );
}
