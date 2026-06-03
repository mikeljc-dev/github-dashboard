<template>
  <div
    class="animate-pulse bg-github-border rounded" :class="[size]"
    aria-hidden="true"
    role="presentation"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: string }>(), { size: 'h-4 w-full' })
</script>
