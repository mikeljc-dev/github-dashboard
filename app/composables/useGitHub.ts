import type { GitHubEvent, GitHubRepo, GitHubUser, LanguageMap } from '~/types/github'

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutos

interface CacheEntry<T> {
  data: T
  ts: number
}

function readCache<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw)
      return null
    const entry = JSON.parse(raw) as CacheEntry<T>
    if (Date.now() - entry.ts > CACHE_TTL_MS) {
      sessionStorage.removeItem(key)
      return null
    }
    return entry.data
  }
  catch {
    sessionStorage.removeItem(key)
    return null
  }
}

function writeCache<T>(key: string, data: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() } satisfies CacheEntry<T>))
  }
  catch {
    // sessionStorage puede estar lleno o deshabilitado
  }
}

function parseApiError(e: unknown): string {
  const err = e as { status?: number, data?: { message?: string } }
  const status = err?.status

  if (status === 404)
    return 'Usuario no encontrado'
  if (status === 403)
    return 'Rate limit excedido. Intenta en unos minutos.'
  if (status === 401)
    return 'Token de GitHub inválido o expirado'
  if (status === 422)
    return 'Nombre de usuario inválido'

  return err?.data?.message ?? 'Error al conectar con GitHub'
}

async function pLimit<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = []
  let idx = 0

  async function worker() {
    while (idx < tasks.length) {
      const i = idx++
      try {
        results[i] = { status: 'fulfilled', value: await tasks[i]() }
      }
      catch (e) {
        results[i] = { status: 'rejected', reason: e }
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker))
  return results
}

export function useGitHub() {
  const store = useGitHubStore()
  let abortController: AbortController | null = null

  const fetchAll = async (username: string) => {
    // Cancelar request anterior si existe
    abortController?.abort()
    abortController = new AbortController()

    store.loading = true
    store.error = null
    store.user = null
    store.repos = []
    store.languages = {}

    const cached = readCache<{ user: GitHubUser, repos: GitHubRepo[] }>(`gh-user-${username}`)
    if (cached) {
      store.user = cached.user
      store.repos = cached.repos
      store.username = username
      store.loading = false
      return
    }

    try {
      const [userData, reposData] = await Promise.all([
        $fetch<GitHubUser>(`/api/github/user?username=${username}`),
        $fetch<GitHubRepo[]>(`/api/github/repos?username=${username}`),
      ])

      if (abortController.signal.aborted)
        return

      store.user = userData
      store.repos = reposData
      store.username = username
      writeCache(`gh-user-${username}`, { user: userData, repos: reposData })
    }
    catch (e) {
      if (!abortController.signal.aborted) {
        store.error = parseApiError(e)
      }
    }
    finally {
      store.loading = false
    }
  }

  const fetchLanguages = async (username: string, repoNames: string[]) => {
    const cached = readCache<LanguageMap>(`gh-langs-${username}`)
    if (cached) {
      store.languages = cached
      return
    }

    // Máximo 8 requests concurrentes para no saturar la API
    const tasks = repoNames.map(repo => () =>
      $fetch<LanguageMap>(`/api/github/languages/${repo}?username=${username}`),
    )
    const results = await pLimit(tasks, 8)

    const merged: LanguageMap = {}
    for (const result of results) {
      if (result.status === 'fulfilled') {
        for (const [lang, bytes] of Object.entries(result.value)) {
          merged[lang] = (merged[lang] ?? 0) + bytes
        }
      }
    }

    store.languages = merged
    writeCache(`gh-langs-${username}`, merged)
  }

  const fetchEvents = async (username: string): Promise<GitHubEvent[]> => {
    const cached = readCache<GitHubEvent[]>(`gh-events-${username}`)
    if (cached)
      return cached

    const data = await $fetch<GitHubEvent[]>(`/api/github/events?username=${username}`)
    writeCache(`gh-events-${username}`, data)
    return data
  }

  return { fetchAll, fetchLanguages, fetchEvents }
}
