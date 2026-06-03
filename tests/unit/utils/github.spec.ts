import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatDate, LANG_COLORS, langColor, timeAgo } from '../../../app/utils/github'

describe('timeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('devuelve "hace 1m" para diferencias menores a 2 minutos', () => {
    const date = new Date('2024-06-01T11:59:00Z').toISOString()
    expect(timeAgo(date)).toBe('hace 1m')
  })

  it('devuelve minutos correctos', () => {
    const date = new Date('2024-06-01T11:45:00Z').toISOString()
    expect(timeAgo(date)).toBe('hace 15m')
  })

  it('devuelve horas correctas', () => {
    const date = new Date('2024-06-01T09:00:00Z').toISOString()
    expect(timeAgo(date)).toBe('hace 3h')
  })

  it('devuelve "ayer" para exactamente 1 día', () => {
    const date = new Date('2024-05-31T12:00:00Z').toISOString()
    expect(timeAgo(date)).toBe('ayer')
  })

  it('devuelve días correctos', () => {
    const date = new Date('2024-05-25T12:00:00Z').toISOString()
    expect(timeAgo(date)).toBe('hace 7d')
  })

  it('devuelve meses correctos', () => {
    const date = new Date('2024-03-01T12:00:00Z').toISOString()
    expect(timeAgo(date)).toBe('hace 3m')
  })

  it('devuelve años correctos', () => {
    const date = new Date('2022-06-01T12:00:00Z').toISOString()
    expect(timeAgo(date)).toBe('hace 2a')
  })
})

describe('formatDate', () => {
  it('formatea correctamente una fecha ISO', () => {
    const result = formatDate('2021-03-15T00:00:00Z')
    expect(result).toMatch(/marzo|March/i)
    expect(result).toContain('2021')
  })

  it('devuelve un string no vacío para cualquier fecha válida', () => {
    expect(formatDate('2023-01-01T00:00:00Z')).toBeTruthy()
  })
})

describe('langColor', () => {
  it('devuelve el color correcto para TypeScript', () => {
    expect(langColor('TypeScript')).toBe(LANG_COLORS.TypeScript)
  })

  it('devuelve el color correcto para Vue', () => {
    expect(langColor('Vue')).toBe('#41b883')
  })

  it('devuelve color gris por defecto para lenguajes desconocidos', () => {
    expect(langColor('CobolScript')).toBe('#8b949e')
  })

  it('devuelve color gris para null', () => {
    expect(langColor(null)).toBe('#8b949e')
  })
})

describe('lANG_COLORS', () => {
  it('contiene los lenguajes más populares', () => {
    const expected = ['TypeScript', 'JavaScript', 'Python', 'Vue', 'Go', 'Rust']
    expected.forEach((lang) => {
      expect(LANG_COLORS).toHaveProperty(lang)
    })
  })

  it('todos los valores son strings de color hexadecimal válidos', () => {
    Object.values(LANG_COLORS).forEach((color) => {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })
})
