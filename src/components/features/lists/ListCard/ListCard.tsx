'use client';

import { MoreVertical, Users } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import { Avatar, Badge, Card, CardContent, CardHeader } from '@/components/ui';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface ShoppingList {
  id: string;
  name: string;
  description?: string;
  budget?: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  isTemplate: boolean;
  color?: string;
  icon?: string;
  itemCount: number;
  completedCount: number;
  createdAt: string;
  updatedAt: string;
  owner: User;
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
  collaborators?: Array<{
    id: string;
    role: string;
    user: User;
  }>;
}

interface ListCardProps {
  list: ShoppingList;
}

export function ListCard({ list }: ListCardProps) {
  // Calculate progress percentage
  const progressPercent = useMemo(() => {
    if (list.itemCount === 0) return 0;
    return Math.round((list.completedCount / list.itemCount) * 100);
  }, [list.itemCount, list.completedCount]);

  // Calculate budget progress if budget is set
  const _budgetPercent = useMemo(() => {
    if (!list.budget) return null;
    // This would need actual spent amount from items
    // For now, we'll use a placeholder
    return 0;
  }, [list.budget]);

  // Format timestamp
  const lastUpdated = useMemo(() => {
    const date = new Date(list.updatedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }, [list.updatedAt]);

  // Get first 3 collaborators for display
  const displayCollaborators = useMemo(() => {
    if (!list.collaborators) return [];
    return list.collaborators.slice(0, 3);
  }, [list.collaborators]);

  const hasMoreCollaborators = (list.collaborators?.length ?? 0) > 3;

  return (
    <Link href={`/lists/${list.id}`}>
      <Card className="group transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg text-xl',
                  list.color
                    ? `bg-${list.color}-100 text-${list.color}-600`
                    : 'bg-muted'
                )}
              >
                {list.icon || '🛒'}
              </div>

              {/* Title */}
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-primary">
                  {list.name}
                </h3>
                {list.isTemplate && (
                  <Badge variant="secondary" className="mt-1">
                    Template
                  </Badge>
                )}
              </div>
            </div>

            {/* Menu Button */}
            <button
              className="rounded p-1 hover:bg-muted"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Open menu
              }}
              aria-label="List options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Item Count & Progress */}
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {list.itemCount} {list.itemCount === 1 ? 'item' : 'items'}
              </span>
              {list.itemCount > 0 && (
                <span className="font-medium">{progressPercent}%</span>
              )}
            </div>
            {list.itemCount > 0 && (
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>

          {/* Budget */}
          {list.budget && (
            <div className="text-sm text-muted-foreground">
              Budget: ${list.budget.toFixed(2)}
            </div>
          )}

          {/* Collaborators */}
          {displayCollaborators.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="flex -space-x-2">
                {displayCollaborators.map((collab) => (
                  <Avatar
                    key={collab.id}
                    src={collab.user.avatarUrl}
                    alt={collab.user.name}
                    className="h-6 w-6 border-2 border-background"
                  />
                ))}
                {hasMoreCollaborators && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                    +{(list.collaborators?.length ?? 0) - 3}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-xs text-muted-foreground">
            Updated {lastUpdated}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
