/**
 * Centralized error logging helper.
 * In production, this could be replaced with Sentry or similar.
 */
export function logError(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[${context}] ${message}`);
}
