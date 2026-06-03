import type { ContributionCalendar, GitHubEvent, GitHubRepo, GitHubUser, LanguageMap } from '~/types/github'
import { pLimit } from '~/utils/async'
import { readCache, writeCache } from '~/utils/cache'
import { MAX_LANGUAGE_CONCURRENCY } from '~/utils/constants'

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

export function useGitHub() {
  const store = useGitHubStore()
  let abortController: AbortController | null = null

  const fetchAll = async (username: string) => {
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
      if (!abortController.signal.aborted)
        store.error = parseApiError(e)
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

    const tasks = repoNames.map(repo => () =>
      $fetch<LanguageMap>(`/api/github/languages/${repo}?username=${username}`),
    )
    const results = await pLimit(tasks, MAX_LANGUAGE_CONCURRENCY)

    const merged: LanguageMap = {}
    for (const result of results) {
      if (result.status === 'fulfilled') {
        for (const [lang, bytes] of Object.entries(result.value))
          merged[lang] = (merged[lang] ?? 0) + bytes
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

  const fetchContributions = async (username: string): Promise<ContributionCalendar | null> => {
    const cached = readCache<ContributionCalendar>(`gh-contrib-${username}`)
    if (cached)
      return cached
    try {
      const data = await $fetch<ContributionCalendar>(`/api/github/contributions?username=${username}`)
      writeCache(`gh-contrib-${username}`, data)
      return data
    }
    catch {
      return null
    }
  }

  return { fetchAll, fetchLanguages, fetchEvents, fetchContributions }
}
