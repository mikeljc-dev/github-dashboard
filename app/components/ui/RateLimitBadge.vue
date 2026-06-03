<template>
  <div
    v-if="rateLimit"
    class="flex items-center gap-1.5 text-xs tabular-nums"
    :class="colorClass"
    :title="tooltip"
    role="status"
    :aria-label="tooltip"
  >
    <span
      class="h-1.5 w-1.5 rounded-full"
      :class="dotClass"
      aria-hidden="true"
    />
    {{ rateLimit.core.remaining }}/{{ rateLimit.core.limit }}
  </div>
</template>

<script setup lang="ts">
import type { RateLimit } from '~/types/github'

const props = defineProps<{ rateLimit: RateLimit | null }>()

const colorClass = computed(() => {
  if (!props.rateLimit)
    return 'text-github-muted'
  const { remaining, limit } = props.rateLimit.core
  const pct = remaining / limit
  if (pct > 0.5)
    return 'text-github-muted'
  if (pct > 0.2)
    return 'text-yellow-500'
  return 'text-red-400'
})

const dotClass = computed(() => {
  if (!props.rateLimit)
    return 'bg-github-muted'
  const { remaining, limit } = props.rateLimit.core
  const pct = remaining / limit
  if (pct > 0.5)
    return 'bg-github-green'
  if (pct > 0.2)
    return 'bg-yellow-500'
  return 'bg-red-400'
})

const tooltip = computed(() => {
  if (!props.rateLimit)
    return 'Rate limit de la API de GitHub'
  const { remaining, limit, reset } = props.rateLimit.core
  const resetTime = new Date(reset * 1000).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `API GitHub: ${remaining} de ${limit} peticiones restantes. Reset a las ${resetTime}`
})
</script>
