<template>
  <div class="relative">
    <svg
      class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-github-muted pointer-events-none"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      :id="inputId"
      :value="modelValue"
      type="search"
      :placeholder="placeholder"
      :aria-label="ariaLabel || placeholder"
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
      class="w-full rounded-lg border border-github-border bg-github-surface pl-9 pr-4 py-2 text-sm text-github-text placeholder-github-muted focus:border-github-accent focus:outline-none focus:ring-2 focus:ring-github-accent/30 transition-colors"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  placeholder?: string
  ariaLabel?: string
  inputId?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
