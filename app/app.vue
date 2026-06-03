<template>
  <div class="min-h-screen bg-github-dark text-github-text">
    <NuxtRouteAnnouncer />
    <!-- Skip to content — primer elemento del DOM, visible solo con foco -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-github-accent focus:text-white focus:text-sm focus:font-medium"
    >
      Saltar al contenido principal
    </a>
    <NuxtPage />
  </div>
</template>
