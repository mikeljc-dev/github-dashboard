<template>
  <div class="rounded-lg border border-github-border bg-github-surface p-6">
    <div class="flex flex-col sm:flex-row items-start gap-5">
      <img
        :src="user.avatar_url"
        :alt="`Avatar de ${user.name || user.login}`"
        class="w-20 h-20 rounded-full ring-2 ring-github-border shrink-0"
      >
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-3 mb-1">
          <h2 class="text-xl font-bold text-github-text">
            {{ user.name || user.login }}
          </h2>
          <a
            :href="user.html_url"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`Ver perfil de ${user.login} en GitHub (abre en nueva pestaña)`"
            class="text-github-accent text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-github-accent focus:ring-offset-1 focus:ring-offset-github-surface rounded"
          >
            @{{ user.login }}
          </a>
        </div>

        <p v-if="user.bio" class="text-github-muted text-sm mb-3">
          {{ user.bio }}
        </p>

        <div class="flex flex-wrap gap-x-4 gap-y-1.5 text-github-muted text-xs">
          <span v-if="user.company" class="flex items-center gap-1">
            🏢 {{ user.company }}
          </span>
          <span v-if="user.location" class="flex items-center gap-1">
            📍 {{ user.location }}
          </span>
          <span v-if="user.blog" class="flex items-center gap-1">
            🔗
            <a
              :href="blogUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-github-accent hover:underline truncate max-w-48"
            >
              {{ user.blog }}
            </a>
          </span>
          <span class="flex items-center gap-1">
            📅 Desde {{ formatDate(user.created_at) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GitHubUser } from '~/types/github'
import { formatDate } from '~/utils/github'

const props = defineProps<{ user: GitHubUser }>()

const blogUrl = computed(() => {
  const blog = props.user.blog ?? ''
  if (!blog) return ''
  return blog.startsWith('http') ? blog : `https://${blog}`
})
</script>
