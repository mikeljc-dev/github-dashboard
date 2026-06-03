<template>
  <section aria-label="Lista de repositorios">
    <div class="flex flex-wrap gap-3 mb-4" role="search" aria-label="Filtros de repositorios">
      <UiSearchInput
        v-model="search"
        placeholder="Buscar repositorios..."
        aria-label="Buscar repositorios por nombre o descripción"
        input-id="repo-search"
        class="flex-1 min-w-48"
      />

      <label class="sr-only" for="language-filter">Filtrar por lenguaje</label>
      <select
        id="language-filter"
        v-model="selectedLanguage"
        class="rounded-lg border border-github-border bg-github-surface px-3 py-2 text-sm text-github-text focus:border-github-accent focus:outline-none focus:ring-2 focus:ring-github-accent/30"
        aria-label="Filtrar por lenguaje de programación"
      >
        <option value="">Todos los lenguajes</option>
        <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
      </select>

      <label class="sr-only" for="sort-select">Ordenar repositorios</label>
      <select
        id="sort-select"
        v-model="sortBy"
        class="rounded-lg border border-github-border bg-github-surface px-3 py-2 text-sm text-github-text focus:border-github-accent focus:outline-none focus:ring-2 focus:ring-github-accent/30"
        aria-label="Ordenar repositorios"
      >
        <option value="updated">Más reciente</option>
        <option value="stars">Más estrellas</option>
        <option value="name">Nombre</option>
      </select>

      <label class="flex items-center gap-2 text-sm text-github-muted cursor-pointer select-none">
        <input
          v-model="excludeForks"
          type="checkbox"
          class="accent-github-accent focus:ring-2 focus:ring-github-accent"
          aria-describedby="fork-description"
        />
        Excluir forks
        <span id="fork-description" class="sr-only">Ocultar repositorios que son forks de otros proyectos</span>
      </label>
    </div>

    <!-- Live region para anunciar resultados -->
    <p class="sr-only" aria-live="polite" aria-atomic="true">
      {{ filtered.length }} repositorio{{ filtered.length !== 1 ? 's' : '' }} encontrado{{ filtered.length !== 1 ? 's' : '' }}
    </p>

    <div v-if="filtered.length" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <DashboardRepoCard v-for="repo in filtered" :key="repo.id" :repo="repo" />
    </div>
    <div v-else role="status" class="py-16 text-center text-github-muted">
      <p class="text-lg">No se encontraron repositorios</p>
      <p class="text-sm mt-1">Intenta ajustar los filtros</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { GitHubRepo } from '~/types/github'

const props = defineProps<{ repos: GitHubRepo[] }>()

const reposRef = computed(() => props.repos)
const { search, selectedLanguage, sortBy, excludeForks, languages, filtered } = useRepos(reposRef)
</script>
