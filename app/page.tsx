import HomePage from '@/components/home/HomePage';
import { RoleBasedRedirect } from '@/components/auth/role-redirect';

/**
 * Home Page Route
 * 
 * Server Component that renders the HomePage with streaming SSR.
 * All sections are streamed progressively via Suspense boundaries.
 * Role-based redirects are handled by RoleBasedRedirect component.
 */
export default function Page() {
	return (
		<>
			<RoleBasedRedirect />
			<HomePage />
		</>
	);
}