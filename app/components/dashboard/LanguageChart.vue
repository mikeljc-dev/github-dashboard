<template>
  <div class="rounded-lg border border-github-border bg-github-surface p-5">
    <h2 class="text-github-text font-semibold mb-4">Lenguajes más usados</h2>
    <div v-if="hasData" class="flex flex-col sm:flex-row items-center gap-6">
      <div class="w-48 h-48 shrink-0">
        <ClientOnly>
          <Doughnut :data="data" :options="options" />
        </ClientOnly>
      </div>
      <ul class="space-y-2 w-full">
        <li
          v-for="(label, i) in chartData.labels"
          :key="label"
          class="flex items-center justify-between text-sm"
        >
          <span class="flex items-center gap-2 text-github-text">
            <span class="h-3 w-3 rounded-sm shrink-0" :style="{ background: chartData.colors[i] }" />
            {{ label }}
          </span>
          <span class="text-github-muted">{{ percentage(chartData.data[i]) }}%</span>
        </li>
      </ul>
    </div>
    <p v-else class="text-github-muted text-sm">Sin datos de lenguajes</p>
  </div>
</template>

<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import type { LanguageMap } from '~/types/github'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{ languages: LanguageMap }>()

const languagesRef = computed(() => props.languages)
const { chartData } = useLanguages(languagesRef)

const hasData = computed(() => chartData.value.data.length > 0)

const total = computed(() => chartData.value.data.reduce((a, b) => a + b, 0))
const percentage = (val: number) => total.value ? ((val / total.value) * 100).toFixed(1) : '0'

const data = computed(() => ({
  labels: chartData.value.labels,
  datasets: [{
    data: chartData.value.data,
    backgroundColor: chartData.value.colors,
    borderColor: '#161b22',
    borderWidth: 2,
    hoverOffset: 4,
  }]
}))

const options = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: { label: string; parsed: number }) =>
          ` ${ctx.label}: ${(ctx.parsed / 1024).toFixed(0)} KB`
      }
    }
  }
}
</script>
