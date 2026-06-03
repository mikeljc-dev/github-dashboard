export default defineEventHandler(async (event) => {
  const { githubToken } = useRuntimeConfig()
  const username = validateUsername(getQuery(event).username as string | undefined)

  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
  })

  return githubFetch(
    `/users/${username}/repos?per_page=100&sort=updated&type=owner`,
    githubToken
  )
})
