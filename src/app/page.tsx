import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to lists page
  redirect('/lists');
}
