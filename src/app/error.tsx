'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Button } from '@/components/ui';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Log to error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
          <div className="text-center">
            <h1 className="mb-2 text-4xl font-bold">500</h1>
            <h2 className="mb-4 text-2xl font-semibold">
              Something went wrong
            </h2>
            <p className="mb-6 text-muted-foreground">
              We encountered an unexpected error. Please try again.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => router.push('/')}>
                Go Home
              </Button>
              <Button onClick={reset}>Try Again</Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
