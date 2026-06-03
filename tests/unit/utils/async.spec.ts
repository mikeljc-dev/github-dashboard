import { describe, expect, it, vi } from 'vitest'
import { pLimit, withRetry } from '../../../app/utils/async'

describe('pLimit', () => {
  it('ejecuta todas las tareas y devuelve resultados', async () => {
    const tasks = [1, 2, 3].map(n => () => Promise.resolve(n))
    const results = await pLimit(tasks, 2)
    expect(results).toHaveLength(3)
    expect(results.every(r => r.status === 'fulfilled')).toBe(true)
  })

  it('maneja tareas fallidas sin romper las demás', async () => {
    const tasks = [
      () => Promise.resolve('ok'),
      () => Promise.reject(new Error('fail')),
      () => Promise.resolve('also ok'),
    ]
    const results = await pLimit(tasks, 3)
    expect(results[0]).toMatchObject({ status: 'fulfilled', value: 'ok' })
    expect(results[1]).toMatchObject({ status: 'rejected' })
    expect(results[2]).toMatchObject({ status: 'fulfilled', value: 'also ok' })
  })

  it('respeta el límite de concurrencia', async () => {
    let concurrent = 0
    let maxConcurrent = 0
    const tasks = Array.from({ length: 6 }, () => () => {
      concurrent++
      maxConcurrent = Math.max(maxConcurrent, concurrent)
      return new Promise<void>(resolve => setTimeout(() => {
        concurrent--
        resolve()
      }, 5))
    })
    await pLimit(tasks, 2)
    expect(maxConcurrent).toBeLessThanOrEqual(2)
  })

  it('devuelve array vacío para tareas vacías', async () => {
    const results = await pLimit([], 3)
    expect(results).toHaveLength(0)
  })
})

describe('withRetry', () => {
  it('devuelve el resultado si no hay error', async () => {
    const fn = vi.fn().mockResolvedValue('success')
    const result = await withRetry(fn, { maxAttempts: 3, delayMs: 0 })
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('reintenta en error de red y tiene éxito al segundo intento', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce('success')
    const result = await withRetry(fn, { maxAttempts: 3, delayMs: 0 })
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('no reintenta en error 4xx (cliente)', async () => {
    const fn = vi.fn().mockRejectedValue({ status: 404 })
    await expect(withRetry(fn, { maxAttempts: 3, delayMs: 0 })).rejects.toMatchObject({ status: 404 })
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('reintenta en error 5xx (servidor) y tiene éxito', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce({ status: 503 })
      .mockResolvedValueOnce('recovered')
    const result = await withRetry(fn, { maxAttempts: 3, delayMs: 0 })
    expect(result).toBe('recovered')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('lanza el error tras agotar todos los intentos', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'))
    await expect(withRetry(fn, { maxAttempts: 3, delayMs: 0 })).rejects.toThrow('always fails')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('usa shouldRetry personalizado', async () => {
    const fn = vi.fn().mockRejectedValue({ status: 429 })
    const shouldRetry = (e: unknown) => (e as { status: number }).status === 429
    await expect(
      withRetry(fn, { maxAttempts: 2, delayMs: 0, shouldRetry }),
    ).rejects.toMatchObject({ status: 429 })
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
