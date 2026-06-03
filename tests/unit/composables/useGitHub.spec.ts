import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock $fetch global antes de importar el composable
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => { store[key] = val },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
vi.stubGlobal('sessionStorage', sessionStorageMock)

const { useGitHub } = await import('../../../app/composables/useGitHub')
const { useGitHubStore } = await import('../../../app/stores/github')

const MOCK_USER = {
  login: 'testuser', name: 'Test User', avatar_url: 'https://example.com/avatar.png',
  bio: 'Test bio', company: null, location: 'Madrid', blog: null,
  twitter_username: null, public_repos: 10, followers: 100, following: 50,
  html_url: 'https://github.com/testuser', created_at: '2020-01-01T00:00:00Z',
}

const MOCK_REPOS = [
  { id: 1, name: 'repo-1', full_name: 'testuser/repo-1', description: null, html_url: '', stargazers_count: 5, forks_count: 1, language: 'TypeScript', updated_at: '2024-01-01T00:00:00Z', topics: [], fork: false, archived: false },
  { id: 2, name: 'repo-2', full_name: 'testuser/repo-2', description: null, html_url: '', stargazers_count: 0, forks_count: 0, language: 'Vue', updated_at: '2024-01-01T00:00:00Z', topics: [], fork: false, archived: false },
]

describe('useGitHub — fetchAll', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorageMock.clear()
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('carga usuario y repos correctamente', async () => {
    mockFetch.mockResolvedValueOnce(MOCK_USER).mockResolvedValueOnce(MOCK_REPOS)
    const store = useGitHubStore()
    const { fetchAll } = useGitHub()

    await fetchAll('testuser')

    expect(store.user).toEqual(MOCK_USER)
    expect(store.repos).toEqual(MOCK_REPOS)
    expect(store.username).toBe('testuser')
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('guarda en caché tras la primera carga', async () => {
    mockFetch.mockResolvedValueOnce(MOCK_USER).mockResolvedValueOnce(MOCK_REPOS)
    const { fetchAll } = useGitHub()
    await fetchAll('testuser')

    expect(sessionStorageMock.getItem('gh-user-testuser')).not.toBeNull()
  })

  it('usa la caché en la segunda llamada sin hacer fetch', async () => {
    mockFetch.mockResolvedValueOnce(MOCK_USER).mockResolvedValueOnce(MOCK_REPOS)
    const { fetchAll } = useGitHub()
    await fetchAll('testuser')
    mockFetch.mockReset()

    const store = useGitHubStore()
    await fetchAll('testuser')

    expect(mockFetch).not.toHaveBeenCalled()
    expect(store.user?.login).toBe('testuser')
  })

  it('maneja error 404 con mensaje "Usuario no encontrado"', async () => {
    mockFetch.mockRejectedValue({ status: 404, data: { message: 'Not Found' } })
    const store = useGitHubStore()
    const { fetchAll } = useGitHub()

    await fetchAll('usuario-que-no-existe')

    expect(store.error).toBe('Usuario no encontrado')
    expect(store.user).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('maneja error 403 con mensaje de rate limit', async () => {
    mockFetch.mockRejectedValue({ status: 403 })
    const store = useGitHubStore()
    const { fetchAll } = useGitHub()

    await fetchAll('testuser')

    expect(store.error).toContain('Rate limit')
  })

  it('resetea user y repos al iniciar una nueva búsqueda', async () => {
    mockFetch.mockResolvedValueOnce(MOCK_USER).mockResolvedValueOnce(MOCK_REPOS)
    const store = useGitHubStore()
    const { fetchAll } = useGitHub()
    await fetchAll('testuser')

    mockFetch.mockRejectedValue({ status: 404 })
    await fetchAll('otro-usuario')

    expect(store.user).toBeNull()
    expect(store.repos).toHaveLength(0)
  })

  it('pone loading en true durante la carga', async () => {
    let resolveUser!: (v: unknown) => void
    const userPromise = new Promise(r => { resolveUser = r })
    mockFetch.mockReturnValueOnce(userPromise).mockResolvedValueOnce(MOCK_REPOS)

    const store = useGitHubStore()
    const { fetchAll } = useGitHub()
    const loadPromise = fetchAll('testuser')

    expect(store.loading).toBe(true)
    resolveUser(MOCK_USER)
    await loadPromise
    expect(store.loading).toBe(false)
  })
})

describe('useGitHub — fetchLanguages', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorageMock.clear()
    mockFetch.mockReset()
  })

  it('agrega bytes de múltiples repos por lenguaje', async () => {
    mockFetch
      .mockResolvedValueOnce({ TypeScript: 1000, CSS: 200 })
      .mockResolvedValueOnce({ TypeScript: 500, Vue: 300 })

    const store = useGitHubStore()
    const { fetchLanguages } = useGitHub()
    await fetchLanguages('testuser', ['repo-1', 'repo-2'])

    expect(store.languages['TypeScript']).toBe(1500)
    expect(store.languages['CSS']).toBe(200)
    expect(store.languages['Vue']).toBe(300)
  })

  it('ignora repos que fallan sin romper los demás', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ Python: 800 })

    const store = useGitHubStore()
    const { fetchLanguages } = useGitHub()
    await fetchLanguages('testuser', ['repo-fail', 'repo-ok'])

    expect(store.languages['Python']).toBe(800)
  })
})
