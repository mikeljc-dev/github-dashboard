<template>
  <div
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
    class="flex items-center gap-3 rounded-lg border border-red-800 bg-red-900/20 px-4 py-3 text-red-400"
  >
    <svg class="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
    </svg>
    <span class="flex-1 text-sm">{{ message }}</span>
    <button
      type="button"
      class="text-red-400 hover:text-red-200 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-transparent rounded"
      @click="emit('retry')"
    >
      Reintentar
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ message: string }>()
const emit = defineEmits<{ retry: [] }>()
</script>
