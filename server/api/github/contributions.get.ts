interface ContributionDay {
  date: string
  contributionCount: number
  color: string
}

interface ContributionWeek {
  contributionDays: ContributionDay[]
}

interface GraphQLResponse {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number
          weeks: ContributionWeek[]
        }
      }
    }
  }
  errors?: { message: string }[]
}

export default defineEventHandler(async (event) => {
  const { githubToken } = useRuntimeConfig()
  const username = validateUsername(getQuery(event).username as string | undefined)

  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
  })

  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }
        }
      }
    }
  `

  const response = await $fetch<GraphQLResponse>('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables: { login: username } }),
  })

  if (response.errors?.length)
    throw createError({ statusCode: 400, message: response.errors[0]?.message ?? 'GraphQL error' })

  const calendar = response.data?.user?.contributionsCollection?.contributionCalendar

  if (!calendar)
    throw createError({ statusCode: 404, message: 'Usuario no encontrado' })

  return calendar
})
