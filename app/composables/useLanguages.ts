import type { LanguageMap } from '~/types/github'
import { LANG_COLORS } from '~/utils/github'

export const useLanguages = (languages: Ref<LanguageMap>) => {
  const chartData = computed(() => {
    const entries = Object.entries(languages.value).sort(([, a], [, b]) => b - a)
    const top6 = entries.slice(0, 6)
    const others = entries.slice(6).reduce((acc, [, v]) => acc + v, 0)

    const labels = top6.map(([lang]) => lang)
    const data = top6.map(([, bytes]) => bytes)
    const colors = top6.map(([lang]) => LANG_COLORS[lang] ?? '#8b949e')

    if (others > 0) {
      labels.push('Otros')
      data.push(others)
      colors.push('#444c56')
    }

    return { labels, data, colors }
  })

  return { chartData }
}
