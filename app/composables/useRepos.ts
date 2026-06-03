import { useDebounceFn } from '@vueuse/core'
import type { GitHubRepo } from '~/types/github'

export type SortOption = 'updated' | 'stars' | 'name'

export const useRepos = (repos: Ref<GitHubRepo[]>) => {
  const search = ref('')
  const selectedLanguage = ref('')
  const sortBy = ref<SortOption>('updated')
  const excludeForks = ref(false)

  const debouncedSearch = ref('')
  const updateSearch = useDebounceFn((val: string) => {
    debouncedSearch.value = val
  }, 300)

  watch(search, val => updateSearch(val))

  const languages = computed(() => {
    const langs = repos.value
      .map(r => r.language)
      .filter((l): l is string => !!l)
    return [...new Set(langs)].sort()
  })

  const filtered = computed(() => {
    let result = [...repos.value]

    if (excludeForks.value) result = result.filter(r => !r.fork)
    if (selectedLanguage.value) result = result.filter(r => r.language === selectedLanguage.value)
    if (debouncedSearch.value) {
      const q = debouncedSearch.value.toLowerCase()
      result = result.filter(r => r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q))
    }

    if (sortBy.value === 'stars') result.sort((a, b) => b.stargazers_count - a.stargazers_count)
    else if (sortBy.value === 'name') result.sort((a, b) => a.name.localeCompare(b.name))
    else result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

    return result
  })

  return { search, selectedLanguage, sortBy, excludeForks, languages, filtered }
}
