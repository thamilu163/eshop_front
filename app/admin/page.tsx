import { redirect } from 'next/navigation';

/**
 * Admin root page - redirects to dashboard
 * This ensures /admin always goes to /admin/dashboard
 * while allowing /admin/users, /admin/products, etc. to work normally
 */
export default function AdminPage() {
  redirect('/admin/dashboard');
}
