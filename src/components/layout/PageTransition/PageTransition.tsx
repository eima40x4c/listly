/**
 * PageTransition Component
 *
 * CSS-based page transition — triggers animation on every route change.
 * Uses a key-based approach: remount children with animate class on pathname change.
 * Respects `prefers-reduced-motion`.
 *
 * @module components/layout/PageTransition
 */

'use client';

import { usePathname } from 'next/navigation';
import { type ReactNode, useEffect, useRef, useState } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [transitionKey, setTransitionKey] = useState(pathname);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      prevPathRef.current = pathname;
      setTransitionKey(pathname);
    }
  }, [pathname]);

  return (
    <div key={transitionKey} className="animate-page-enter">
      {children}
    </div>
  );
}

PageTransition.displayName = 'PageTransition';
