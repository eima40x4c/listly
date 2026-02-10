/**
 * Avatar Component
 *
 * A user avatar component with fallback support for initials.
 *
 * @module components/ui/Avatar
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full bg-muted',
  {
    variants: {
      size: {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface AvatarProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof avatarVariants> {
  /** Image URL */
  src?: string | null;
  /** Alt text for image */
  alt?: string;
  /** Fallback text (usually initials) */
  fallback?: string;
}

/**
 * Get initials from a name.
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Avatar component with image and fallback support.
 *
 * @example
 * ```tsx
 * <Avatar src="/avatar.jpg" alt="John Doe" />
 * <Avatar fallback="JD" />
 * <Avatar src="/avatar.jpg" alt="Jane Smith" fallback="JS" size="lg" />
 * ```
 */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, fallback, size, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="aspect-square h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-medium text-muted-foreground">
            {fallback || (alt ? getInitials(alt) : '?')}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { avatarVariants };
