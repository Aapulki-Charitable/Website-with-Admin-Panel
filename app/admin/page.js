import { redirect } from 'next/navigation';
import { isLoggedIn } from '../../lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminIndex() {
  if (await isLoggedIn()) {
    redirect('/admin/dashboard');
  }
  redirect('/admin/login');
}
