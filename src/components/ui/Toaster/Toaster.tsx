/**
 * Toaster Component
 *
 * Wraps Sonner's Toaster with Listly theme integration.
 * Bottom-center on mobile, top-right on desktop.
 *
 * @module components/ui/Toaster
 */

'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Themed toast notification container.
 *
 * @example
 * ```tsx
 * // In root layout
 * <Toaster />
 *
 * // In any component
 * import { toast } from 'sonner';
 * toast.success('Item added');
 * toast.error('Failed to delete');
 * toast('Undo?', { action: { label: 'Undo', onClick: () => {} } });
 * ```
 */
export function Toaster({ ...props }: ToasterProps) {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
}
