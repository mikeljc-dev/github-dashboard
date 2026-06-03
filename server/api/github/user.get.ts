export default defineEventHandler(async (event) => {
  const { githubToken } = useRuntimeConfig()
  const username = validateUsername(getQuery(event).username as string | undefined)

  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
  })

  return githubFetch(`/users/${username}`, githubToken)
})
