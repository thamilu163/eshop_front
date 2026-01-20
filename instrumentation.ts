export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Register backend validation or observability here
    // await import('./lib/observability/server');
  }
}
