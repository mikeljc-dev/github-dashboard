import type { LanguageMap } from '~/types/github'
import { TOP_LANGUAGES_COUNT } from '~/utils/constants'
import { LANG_COLORS } from '~/utils/github'

export function useLanguages(languages: Ref<LanguageMap>) {
  const chartData = computed(() => {
    const entries = Object.entries(languages.value).sort(([, a], [, b]) => b - a)
    const top = entries.slice(0, TOP_LANGUAGES_COUNT)
    const others = entries.slice(TOP_LANGUAGES_COUNT).reduce((acc, [, v]) => acc + v, 0)

    const labels = top.map(([lang]) => lang)
    const data = top.map(([, bytes]) => bytes)
    const colors = top.map(([lang]) => LANG_COLORS[lang] ?? '#8b949e')

    if (others > 0) {
      labels.push('Otros')
      data.push(others)
      colors.push('#444c56')
    }

    return { labels, data, colors }
  })

  return { chartData }
}
