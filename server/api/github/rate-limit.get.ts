interface RateLimitResponse {
  resources: {
    core: { limit: number, remaining: number, reset: number }
    graphql: { limit: number, remaining: number, reset: number }
  }
}

export default defineEventHandler(async (event) => {
  const { githubToken } = useRuntimeConfig()

  setResponseHeaders(event, {
    'Cache-Control': 'no-store',
  })

  const data = await githubFetch<RateLimitResponse>('/rate_limit', githubToken)

  return {
    core: {
      limit: data.resources.core.limit,
      remaining: data.resources.core.remaining,
      reset: data.resources.core.reset,
    },
    graphql: {
      limit: data.resources.graphql.limit,
      remaining: data.resources.graphql.remaining,
      reset: data.resources.graphql.reset,
    },
  }
})
