export function logError(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  const timestamp = new Date().toISOString();
  console.warn(`[${timestamp}] [${context}] ${message}`);
}
