<template>
  <div
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
    class="flex items-center gap-3 rounded-lg border border-red-800 bg-red-900/20 px-4 py-3 text-red-400"
  >
    <IconsIconXCircle class="h-5 w-5 shrink-0" />
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
