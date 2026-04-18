/**
 * Logs an error with a context tag. Centralises error reporting so it can
 * later be wired up to a crash-reporting SDK (e.g. Sentry) in one place.
 */
export function logError(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${context}]`, message);
}
