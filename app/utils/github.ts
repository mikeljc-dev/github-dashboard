export const LANG_COLORS: Record<string, string> = {
  'TypeScript': '#3178c6',
  'JavaScript': '#f1e05a',
  'Vue': '#41b883',
  'Python': '#3572A5',
  'Rust': '#dea584',
  'Go': '#00ADD8',
  'Java': '#b07219',
  'CSS': '#563d7c',
  'HTML': '#e34c26',
  'Shell': '#89e051',
  'C': '#555555',
  'C++': '#f34b7d',
  'Ruby': '#701516',
  'PHP': '#4F5D95',
  'Swift': '#F05138',
  'Kotlin': '#A97BFF',
  'Dart': '#00B4AB',
  'C#': '#178600',
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60)
    return mins <= 1 ? 'hace 1m' : `hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24)
    return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1)
    return 'ayer'
  if (days < 30)
    return `hace ${days}d`
  if (days < 365)
    return `hace ${Math.floor(days / 30)}m`
  return `hace ${Math.floor(days / 365)}a`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })
}

export function langColor(lang: string | null): string {
  return LANG_COLORS[lang ?? ''] ?? '#8b949e'
}
