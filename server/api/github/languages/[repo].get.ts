export default defineEventHandler(async (event) => {
  const { githubToken } = useRuntimeConfig()
  const repo = getRouterParam(event, 'repo')
  const username = validateUsername(getQuery(event).username as string | undefined)

  if (!repo)
    throw createError({ statusCode: 400, message: 'El parámetro repo es requerido' })

  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
  })

  return githubFetch(`/repos/${username}/${repo}/languages`, githubToken)
})
