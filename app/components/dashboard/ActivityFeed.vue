<template>
  <div class="rounded-lg border border-github-border bg-github-surface p-5">
    <h2 class="text-github-text font-semibold mb-4">
      Actividad reciente
    </h2>
    <ul class="space-y-1">
      <li
        v-for="event in events"
        :key="event.id"
        class="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-white/5 transition-colors"
      >
        <span class="text-base shrink-0 mt-0.5 w-6 text-center">{{ eventIcon(event.type) }}</span>
        <div class="flex-1 min-w-0">
          <p class="text-github-text text-sm truncate">
            <span class="font-medium">{{ eventLabel(event.type) }}</span>
            <span class="text-github-muted"> en </span>
            <a
              :href="`https://github.com/${event.repo.name}`"
              target="_blank"
              rel="noopener noreferrer"
              class="text-github-accent hover:underline"
              @click.stop
            >
              {{ event.repo.name.split('/')[1] }}
            </a>
          </p>
          <p class="text-github-muted text-xs mt-0.5">
            {{ timeAgo(event.created_at) }}
          </p>
        </div>
      </li>
    </ul>
    <div v-if="!events.length" class="py-8 text-center text-github-muted">
      <p class="text-sm">
        Sin actividad reciente
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GitHubEvent } from '~/types/github'
import { timeAgo } from '~/utils/github'

defineProps<{ events: GitHubEvent[] }>()

const EVENT_ICONS: Record<string, string> = {
  PushEvent: '📦',
  PullRequestEvent: '🔀',
  PullRequestReviewEvent: '👀',
  IssuesEvent: '🐛',
  IssueCommentEvent: '💬',
  CreateEvent: '✨',
  DeleteEvent: '🗑️',
  ForkEvent: '🍴',
  WatchEvent: '⭐',
  ReleaseEvent: '🚀',
  GollumEvent: '📝',
}

const EVENT_LABELS: Record<string, string> = {
  PushEvent: 'Push',
  PullRequestEvent: 'Pull Request',
  PullRequestReviewEvent: 'Review',
  IssuesEvent: 'Issue',
  IssueCommentEvent: 'Comentó',
  CreateEvent: 'Creó',
  DeleteEvent: 'Eliminó',
  ForkEvent: 'Fork',
  WatchEvent: 'Star',
  ReleaseEvent: 'Release',
  GollumEvent: 'Wiki',
}

const eventIcon = (type: string) => EVENT_ICONS[type] ?? '🔔'
const eventLabel = (type: string) => EVENT_LABELS[type] ?? type
</script>
