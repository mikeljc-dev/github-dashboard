import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearCache, readCache, writeCache } from '../../../app/utils/cache'

const sessionStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => { store[key] = val },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (i: number) => Object.keys(store)[i] ?? null,
  }
})()

vi.stubGlobal('sessionStorage', sessionStorageMock)

describe('writeCache / readCache', () => {
  beforeEach(() => sessionStorageMock.clear())

  it('guarda y recupera datos correctamente', () => {
    writeCache('test-key', { name: 'mikeljc' })
    const result = readCache<{ name: string }>('test-key')
    expect(result).toEqual({ name: 'mikeljc' })
  })

  it('devuelve null si la clave no existe', () => {
    expect(readCache('nonexistent')).toBeNull()
  })

  it('devuelve null y elimina la entrada si está expirada', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))
    writeCache('old-key', 'value')
    vi.setSystemTime(new Date('2024-01-01T00:10:00Z'))
    expect(readCache('old-key')).toBeNull()
    expect(sessionStorageMock.getItem('old-key')).toBeNull()
    vi.useRealTimers()
  })

  it('devuelve datos válidos si no ha expirado', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))
    writeCache('fresh-key', 42)
    vi.setSystemTime(new Date('2024-01-01T00:03:00Z'))
    expect(readCache<number>('fresh-key')).toBe(42)
    vi.useRealTimers()
  })

  it('devuelve null si el JSON es inválido y limpia la entrada', () => {
    sessionStorageMock.setItem('bad-key', 'not-json{{{')
    expect(readCache('bad-key')).toBeNull()
    expect(sessionStorageMock.getItem('bad-key')).toBeNull()
  })
})

describe('clearCache', () => {
  beforeEach(() => sessionStorageMock.clear())

  it('elimina entradas que coinciden con el prefijo', () => {
    writeCache('gh-user-alice', { login: 'alice' })
    writeCache('gh-user-bob', { login: 'bob' })
    writeCache('other-key', 'stays')
    clearCache('gh-user-')
    expect(sessionStorageMock.getItem('gh-user-alice')).toBeNull()
    expect(sessionStorageMock.getItem('gh-user-bob')).toBeNull()
    expect(sessionStorageMock.getItem('other-key')).not.toBeNull()
  })

  it('no falla si no hay entradas con ese prefijo', () => {
    expect(() => clearCache('nonexistent-prefix')).not.toThrow()
  })
})
