export default defineEventHandler(async (event) => {
  const { githubToken } = useRuntimeConfig()
  const username = validateUsername(getQuery(event).username as string | undefined)

  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
  })

  return githubFetch(`/users/${username}/events/public?per_page=10`, githubToken)
})
