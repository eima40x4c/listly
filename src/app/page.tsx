/**
 * Landing Page
 *
 * Mobile-first landing page for signed-out users.
 * Authenticated users are redirected to /lists.
 * Features: hero section, feature highlights, CTA, dark/light mode support.
 *
 * @module app/page
 */

import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth/session';

import { LandingContent } from './landing-content';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/lists');
  }

  return <LandingContent />;
}
