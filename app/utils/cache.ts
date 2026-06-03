import { CACHE_TTL_MS } from '~/utils/constants'

interface CacheEntry<T> {
  data: T
  ts: number
}

export function readCache<T>(key: string): T | null {
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

export function writeCache<T>(key: string, data: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() } satisfies CacheEntry<T>))
  }
  catch {
    // sessionStorage puede estar lleno o deshabilitado
  }
}

export function clearCache(prefix: string): void {
  try {
    const keys = Object.keys(sessionStorage).filter(k => k.startsWith(prefix))
    keys.forEach(k => sessionStorage.removeItem(k))
  }
  catch {
    // sessionStorage no disponible
  }
}
