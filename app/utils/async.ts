interface RetryOptions {
  maxAttempts: number
  delayMs: number
  shouldRetry?: (error: unknown) => boolean
}

/**
 * Reintenta una función async con backoff lineal.
 * Por defecto solo reintenta en errores de red (status >= 500 o sin status).
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  const { maxAttempts, delayMs, shouldRetry = isRetryableError } = options
  let lastError: unknown

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    }
    catch (e) {
      lastError = e
      const willRetry = shouldRetry(e) && attempt < maxAttempts - 1
      if (!willRetry)
        throw e
      await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)))
    }
  }

  throw lastError
}

function isRetryableError(e: unknown): boolean {
  const err = e as { status?: number }
  // Reintenta solo en errores de red (sin status) o errores de servidor (5xx)
  if (!err?.status) return true
  return err.status >= 500
}

/**
 * Ejecuta un array de tareas async con un límite de concurrencia.
 */
export async function pLimit<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = []
  let idx = 0

  async function worker() {
    while (idx < tasks.length) {
      const i = idx++
      try {
        results[i] = { status: 'fulfilled', value: await tasks[i]!() }
      }
      catch (e) {
        results[i] = { status: 'rejected', reason: e }
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker))
  return results
}
