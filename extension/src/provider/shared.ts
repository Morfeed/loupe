/* Error type and retry policy shared by all hosted providers */

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly transient = false,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export function isTransientStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

export async function withRetries<T>(request: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
      if (!(error instanceof ProviderError) || !error.transient || attempt === 2) throw error;
      await new Promise((resolve) => setTimeout(resolve, 400 * 2 ** attempt));
    }
  }
  throw lastError;
}
