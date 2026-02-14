'use client';

import { Mail, X } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Button, Input } from '@/components/ui';

interface ShareListModalProps {
  listId: string;
  listName: string;
  onClose: () => void;
}

export function ShareListModal({
  listId,
  listName,
  onClose,
}: ShareListModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccess(false);

      if (!email.trim()) {
        setError('Please enter an email address');
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await fetch(`/api/v1/lists/${listId}/collaborators`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), role }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to share list');
        }

        setSuccess(true);
        setEmail('');
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to share list');
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, listId, role]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Share "{listName}"</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Permission Level
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={role === 'editor' ? 'primary' : 'outline'}
                className="flex-1"
                onClick={() => setRole('editor')}
                disabled={isSubmitting}
              >
                Can Edit
              </Button>
              <Button
                type="button"
                variant={role === 'viewer' ? 'primary' : 'outline'}
                className="flex-1"
                onClick={() => setRole('viewer')}
                disabled={isSubmitting}
              >
                View Only
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {role === 'editor'
                ? 'Can add, edit, and delete items'
                : 'Can only view the list'}
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-success/10 text-success rounded-md p-3 text-sm">
              Invitation sent successfully!
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
