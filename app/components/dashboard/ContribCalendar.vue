<template>
  <div class="rounded-lg border border-github-border bg-github-surface p-5">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-github-text font-semibold">
        Contribuciones
      </h2>
      <span class="text-github-muted text-xs">
        <span class="font-semibold text-github-text">{{ calendar?.totalContributions ?? 0 }}</span>
        en el último año
      </span>
    </div>

    <ClientOnly>
      <div v-if="calendar" class="overflow-x-auto">
        <!-- Etiquetas de meses -->
        <div class="flex mb-1 ml-6">
          <template v-for="(label, i) in monthLabels" :key="i">
            <span
              class="text-github-muted text-xs shrink-0"
              :style="{ width: `${label.width}px` }"
            >{{ label.name }}</span>
          </template>
        </div>

        <div class="flex gap-1">
          <!-- Etiquetas de días -->
          <div class="flex flex-col gap-1 mr-1 mt-px">
            <span v-for="day in ['', 'Lun', '', 'Mié', '', 'Vie', '']" :key="day" class="text-github-muted text-xs h-3 leading-3">
              {{ day }}
            </span>
          </div>

          <!-- Grid de contribuciones -->
          <div class="flex gap-1">
            <div
              v-for="(week, wi) in calendar.weeks"
              :key="wi"
              class="flex flex-col gap-1"
            >
              <div
                v-for="day in week.contributionDays"
                :key="day.date"
                class="h-3 w-3 rounded-sm cursor-default transition-transform hover:scale-125"
                :style="{ background: day.color === '#ebedf0' ? '#161b22' : day.color }"
                :title="`${day.contributionCount} contribuciones el ${formatDate(day.date)}`"
                :aria-label="`${day.contributionCount} contribuciones el ${formatDate(day.date)}`"
              />
            </div>
          </div>
        </div>

        <!-- Leyenda -->
        <div class="flex items-center gap-1.5 mt-3 justify-end">
          <span class="text-github-muted text-xs">Menos</span>
          <div
            v-for="(color, i) in legendColors"
            :key="i"
            class="h-3 w-3 rounded-sm"
            :style="{ background: color }"
          />
          <span class="text-github-muted text-xs">Más</span>
        </div>
      </div>

      <div v-else class="text-github-muted text-sm py-4 text-center">
        Sin datos de contribuciones
      </div>

      <template #fallback>
        <div class="h-24 animate-pulse bg-github-border rounded" aria-hidden="true" />
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { ContributionCalendar } from '~/types/github'

const props = defineProps<{ calendar: ContributionCalendar | null }>()

const legendColors = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']

const monthLabels = computed(() => {
  if (!props.calendar)
    return []

  const labels: { name: string, width: number }[] = []
  let lastMonth = -1
  let weekCount = 0

  props.calendar.weeks.forEach((week) => {
    const month = new Date(week.contributionDays[0]?.date ?? '').getMonth()
    if (month !== lastMonth) {
      if (lastMonth !== -1) {
        labels[labels.length - 1]!.width = weekCount * 16
        weekCount = 0
      }
      const names = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      labels.push({ name: names[month] ?? '', width: 0 })
      lastMonth = month
    }
    weekCount++
  })

  if (labels.length > 0)
    labels[labels.length - 1]!.width = weekCount * 16

  return labels
})

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
