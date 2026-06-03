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
