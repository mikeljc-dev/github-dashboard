import { defineStore } from 'pinia'
import type { GitHubUser, GitHubRepo, LanguageMap } from '~/types/github'

export const useGitHubStore = defineStore('github', () => {
  const username = ref('mikeljc-dev')
  const user = ref<GitHubUser | null>(null)
  const repos = ref<GitHubRepo[]>([])
  const languages = ref<LanguageMap>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  const totalStars = computed(() =>
    repos.value.reduce((acc, r) => acc + r.stargazers_count, 0)
  )

  const totalForks = computed(() =>
    repos.value.reduce((acc, r) => acc + r.forks_count, 0)
  )

  const topLanguages = computed(() => {
    return Object.entries(languages.value)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
  })

  return { username, user, repos, languages, loading, error, totalStars, totalForks, topLanguages }
})
