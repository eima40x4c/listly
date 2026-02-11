import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui';

export default function ListNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="text-center">
        <h1 className="mb-2 text-4xl font-bold">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">List Not Found</h2>
        <p className="mb-6 text-muted-foreground">
          This list doesn't exist or you don't have access to it.
        </p>
        <Link href="/lists">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lists
          </Button>
        </Link>
      </div>
    </div>
  );
}
