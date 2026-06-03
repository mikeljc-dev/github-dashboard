<template>
  <div
    class="rounded-lg border border-github-border bg-github-surface p-5 flex flex-col gap-3"
    role="figure"
    :aria-label="`${label}: ${value}`"
  >
    <div class="flex items-center justify-between">
      <span class="text-xs font-semibold uppercase tracking-wider text-github-muted">{{ label }}</span>
      <div
        class="h-8 w-8 rounded-lg flex items-center justify-center text-base"
        :class="iconBg"
        aria-hidden="true"
      >
        {{ icon }}
      </div>
    </div>
    <p class="text-3xl font-bold text-github-text tabular-nums" aria-hidden="true">
      {{ formattedValue }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  value: number
  icon: string
  color?: 'blue' | 'yellow' | 'green' | 'purple'
}>()

const formattedValue = computed(() =>
  props.value >= 1000 ? `${(props.value / 1000).toFixed(1)}k` : String(props.value),
)

const iconBg = computed(() => ({
  'bg-blue-500/10': props.color === 'blue' || !props.color,
  'bg-yellow-500/10': props.color === 'yellow',
  'bg-green-500/10': props.color === 'green',
  'bg-purple-500/10': props.color === 'purple',
}))
</script>
