<template>
  <a
    :href="repo.html_url"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="`${repo.name}${repo.description ? `: ${repo.description}` : ''} — Ver en GitHub`"
    class="flex flex-col rounded-lg border border-github-border bg-github-surface p-4 hover:border-github-accent hover:shadow-lg hover:shadow-github-accent/5 transition-all duration-200 group"
  >
    <div class="flex items-start justify-between gap-2 mb-2">
      <h3 class="text-github-accent font-semibold text-sm truncate group-hover:underline" aria-hidden="true">
        {{ repo.name }}
      </h3>
      <div class="flex gap-1.5 shrink-0" aria-hidden="true">
        <span v-if="repo.fork" class="text-xs text-github-muted border border-github-border rounded-full px-2 py-0.5">fork</span>
        <span v-if="repo.archived" class="text-xs text-github-muted border border-github-border rounded-full px-2 py-0.5">archived</span>
      </div>
    </div>

    <p v-if="repo.description" class="text-github-muted text-xs mb-3 line-clamp-2 flex-1" aria-hidden="true">
      {{ repo.description }}
    </p>
    <div v-else class="flex-1" />

    <div v-if="repo.topics?.length" class="flex flex-wrap gap-1.5 mb-3" aria-hidden="true">
      <span
        v-for="topic in repo.topics.slice(0, 4)"
        :key="topic"
        class="text-xs text-github-accent bg-github-accent/10 rounded-full px-2 py-0.5"
      >
        {{ topic }}
      </span>
      <span v-if="repo.topics.length > 4" class="text-xs text-github-muted">+{{ repo.topics.length - 4 }}</span>
    </div>

    <div class="flex items-center gap-4 text-github-muted text-xs mt-auto" aria-hidden="true">
      <span v-if="repo.language" class="flex items-center gap-1.5">
        <span class="h-2.5 w-2.5 rounded-full shrink-0" :style="{ background: repoLangColor }" />
        {{ repo.language }}
      </span>
      <span class="flex items-center gap-1" :title="`${repo.stargazers_count} estrellas`">
        <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.873 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
        </svg>
        {{ repo.stargazers_count }}
      </span>
      <span class="flex items-center gap-1" :title="`${repo.forks_count} forks`">
        <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
        {{ repo.forks_count }}
      </span>
      <span class="ml-auto">{{ timeAgo(repo.updated_at) }}</span>
    </div>
  </a>
</template>

<script setup lang="ts">
import type { GitHubRepo } from '~/types/github'
import { langColor, timeAgo } from '~/utils/github'

const props = defineProps<{ repo: GitHubRepo }>()
const repoLangColor = computed(() => langColor(props.repo.language))
</script>
