import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useRepos } from '../../../app/composables/useRepos'
import type { GitHubRepo } from '../../../app/types/github'

// useDebounceFn → ejecutar inmediatamente en tests
vi.mock('@vueuse/core', () => ({
  useDebounceFn: (fn: (...args: unknown[]) => unknown) => fn,
}))

const makeRepo = (overrides: Partial<GitHubRepo> = {}): GitHubRepo => ({
  id: Math.random(),
  name: 'repo',
  full_name: 'user/repo',
  description: null,
  html_url: 'https://github.com/user/repo',
  stargazers_count: 0,
  forks_count: 0,
  language: null,
  updated_at: '2024-01-01T00:00:00Z',
  topics: [],
  fork: false,
  archived: false,
  ...overrides,
})

const TS_REPO = makeRepo({ id: 1, name: 'alpha', language: 'TypeScript', stargazers_count: 10, updated_at: '2024-03-01T00:00:00Z' })
const JS_REPO = makeRepo({ id: 2, name: 'beta', language: 'JavaScript', stargazers_count: 50, updated_at: '2024-01-01T00:00:00Z' })
const FORK_REPO = makeRepo({ id: 3, name: 'gamma', language: 'TypeScript', fork: true, stargazers_count: 5, updated_at: '2024-02-01T00:00:00Z' })
const DESC_REPO = makeRepo({ id: 4, name: 'delta', description: 'A vue dashboard project', language: 'Vue', stargazers_count: 1, updated_at: '2024-04-01T00:00:00Z' })

describe('useRepos — filtros', () => {
  it('devuelve todos los repos sin filtros', () => {
    const repos = ref([TS_REPO, JS_REPO])
    const { filtered } = useRepos(repos)
    expect(filtered.value).toHaveLength(2)
  })

  it('filtra por lenguaje', async () => {
    const repos = ref([TS_REPO, JS_REPO, FORK_REPO])
    const { filtered, selectedLanguage } = useRepos(repos)
    selectedLanguage.value = 'TypeScript'
    await nextTick()
    expect(filtered.value.every(r => r.language === 'TypeScript')).toBe(true)
  })

  it('excluye forks cuando excludeForks es true', async () => {
    const repos = ref([TS_REPO, FORK_REPO])
    const { filtered, excludeForks } = useRepos(repos)
    excludeForks.value = true
    await nextTick()
    expect(filtered.value.some(r => r.fork)).toBe(false)
    expect(filtered.value).toHaveLength(1)
  })

  it('filtra por nombre (búsqueda)', async () => {
    const repos = ref([TS_REPO, JS_REPO])
    const { filtered, search } = useRepos(repos)
    search.value = 'alph'
    await nextTick()
    expect(filtered.value).toHaveLength(1)
    expect(filtered.value[0].name).toBe('alpha')
  })

  it('filtra por descripción (búsqueda)', async () => {
    const repos = ref([TS_REPO, DESC_REPO])
    const { filtered, search } = useRepos(repos)
    search.value = 'dashboard'
    await nextTick()
    expect(filtered.value).toHaveLength(1)
    expect(filtered.value[0].name).toBe('delta')
  })

  it('búsqueda es case-insensitive', async () => {
    const repos = ref([TS_REPO])
    const { filtered, search } = useRepos(repos)
    search.value = 'ALPHA'
    await nextTick()
    expect(filtered.value).toHaveLength(1)
  })

  it('devuelve lista vacía si no hay coincidencias', async () => {
    const repos = ref([TS_REPO, JS_REPO])
    const { filtered, search } = useRepos(repos)
    search.value = 'zzz-no-existe'
    await nextTick()
    expect(filtered.value).toHaveLength(0)
  })
})

describe('useRepos — ordenamiento', () => {
  it('ordena por estrellas de mayor a menor', async () => {
    const repos = ref([TS_REPO, JS_REPO, FORK_REPO])
    const { filtered, sortBy } = useRepos(repos)
    sortBy.value = 'stars'
    await nextTick()
    expect(filtered.value[0].stargazers_count).toBe(50)
    expect(filtered.value[1].stargazers_count).toBe(10)
    expect(filtered.value[2].stargazers_count).toBe(5)
  })

  it('ordena por nombre alfabéticamente', async () => {
    const repos = ref([JS_REPO, TS_REPO, FORK_REPO])
    const { filtered, sortBy } = useRepos(repos)
    sortBy.value = 'name'
    await nextTick()
    const names = filtered.value.map(r => r.name)
    expect(names).toEqual([...names].sort())
  })

  it('ordena por fecha de actualización (más reciente primero) por defecto', async () => {
    const repos = ref([TS_REPO, JS_REPO, FORK_REPO, DESC_REPO])
    const { filtered } = useRepos(repos)
    await nextTick()
    expect(filtered.value[0].updated_at > filtered.value[1].updated_at).toBe(true)
  })
})

describe('useRepos — languages computed', () => {
  it('extrae lenguajes únicos y los ordena', () => {
    const repos = ref([TS_REPO, JS_REPO, FORK_REPO, DESC_REPO])
    const { languages } = useRepos(repos)
    expect(languages.value).toEqual(['JavaScript', 'TypeScript', 'Vue'])
  })

  it('excluye repos sin lenguaje', () => {
    const noLang = makeRepo({ language: null })
    const repos = ref([TS_REPO, noLang])
    const { languages } = useRepos(repos)
    expect(languages.value).not.toContain(null)
    expect(languages.value).toContain('TypeScript')
  })
})
