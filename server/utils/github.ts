export function githubHeaders(token: string): Record<string, string> {
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

export async function githubFetch<T>(path: string, token: string): Promise<T> {
  try {
    return await $fetch<T>(`https://api.github.com${path}`, {
      headers: githubHeaders(token),
    })
  }
  catch (err: unknown) {
    const e = err as { status?: number, data?: { message?: string } }
    const status = e?.status ?? 500
    const msg = e?.data?.message ?? 'Error desconocido de GitHub'

    if (status === 404)
      throw createError({ statusCode: 404, message: 'Usuario no encontrado' })
    if (status === 403)
      throw createError({ statusCode: 403, message: 'Rate limit excedido. Intenta en unos minutos.' })
    if (status === 422)
      throw createError({ statusCode: 422, message: 'Nombre de usuario inválido' })
    if (status === 401)
      throw createError({ statusCode: 401, message: 'Token de GitHub inválido o expirado' })

    throw createError({ statusCode: status, message: msg })
  }
}

export function validateUsername(username: string | undefined): string {
  if (!username || typeof username !== 'string')
    throw createError({ statusCode: 400, message: 'El parámetro username es requerido' })

  const clean = username.trim()
  if (!/^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/i.test(clean))
    throw createError({ statusCode: 422, message: 'Nombre de usuario inválido' })

  return clean
}
