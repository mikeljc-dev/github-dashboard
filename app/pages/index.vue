<template>
  <div class="min-h-screen bg-github-dark">
    <!-- Navbar -->
    <nav class="sticky top-0 z-10 border-b border-github-border bg-github-dark/80 backdrop-blur-md">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-2.5 text-github-text font-semibold">
          <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
          </svg>
          GitHub Dashboard
        </div>
        <div class="flex items-center gap-3">
          <!-- Botón copiar URL del perfil -->
          <Transition name="fade">
            <button
              v-if="store.user"
              type="button"
              :aria-label="copied ? 'URL copiada' : 'Copiar URL de este perfil'"
              :title="copied ? '¡Copiado!' : 'Compartir perfil'"
              class="flex items-center gap-1.5 text-xs text-github-muted hover:text-github-text transition-colors focus:outline-none focus:ring-2 focus:ring-github-accent rounded px-1"
              @click="copyUrl"
            >
              <svg v-if="!copied" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <svg v-else class="h-4 w-4 text-github-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ copied ? '¡Copiado!' : 'Compartir' }}</span>
            </button>
          </Transition>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs text-github-muted hover:text-github-text transition-colors"
          >
            github.com
          </a>
        </div>
      </div>
    </nav>

    <main id="main-content" class="max-w-6xl mx-auto px-4 py-8">
      <!-- Search -->
      <div class="mb-8">
        <form
          class="flex gap-3 max-w-lg"
          role="search"
          aria-label="Buscar usuario de GitHub"
          @submit.prevent="onSearch"
        >
          <UiSearchInput
            v-model="inputUsername"
            placeholder="Usuario de GitHub..."
            aria-label="Nombre de usuario de GitHub"
            input-id="user-search"
            class="flex-1"
          />
          <button
            type="submit"
            :disabled="isLoading"
            :aria-disabled="isLoading"
            :aria-label="isLoading ? 'Cargando perfil...' : 'Buscar usuario'"
            class="px-5 py-2 rounded-lg bg-github-accent text-white text-sm font-medium hover:bg-blue-400 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-github-accent focus:ring-offset-2 focus:ring-offset-github-dark"
          >
            {{ isLoading ? 'Cargando...' : 'Buscar' }}
          </button>
        </form>
      </div>

      <!-- Error -->
      <Transition name="fade">
        <UiErrorBanner
          v-if="store.error"
          :message="store.error"
          class="mb-6"
          @retry="onSearch"
        />
      </Transition>

      <!-- Skeletons — ocultos a lectores de pantalla, que escuchan el aria-busy -->
      <div
        v-if="isLoading"
        aria-hidden="true"
      >
        <div class="rounded-lg border border-github-border bg-github-surface p-5 mb-6 flex items-center gap-4">
          <UiSkeleton size="h-16 w-16 rounded-full shrink-0" />
          <div class="flex-1 space-y-2">
            <UiSkeleton size="h-5 w-48" />
            <UiSkeleton size="h-3.5 w-64" />
            <UiSkeleton size="h-3.5 w-32" />
          </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <UiSkeleton v-for="n in 4" :key="n" size="h-28 rounded-lg" />
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <UiSkeleton size="h-64 rounded-lg" />
          <UiSkeleton size="h-64 rounded-lg" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <UiSkeleton v-for="n in 6" :key="n" size="h-36 rounded-lg" />
        </div>
      </div>

      <!-- Live region: anuncia cambios de estado a lectores de pantalla -->
      <p class="sr-only" aria-live="polite" aria-atomic="true">
        <template v-if="isLoading">
          Cargando perfil de {{ inputUsername }}…
        </template>
        <template v-else-if="store.user">
          Perfil de {{ store.user.login }} cargado con {{ store.repos.length }} repositorios.
        </template>
      </p>

      <!-- Content -->
      <Transition name="fade">
        <div v-if="!isLoading && store.user">
          <!-- Profile -->
          <div class="rounded-lg border border-github-border bg-github-surface p-6 mb-6">
            <div class="flex flex-col sm:flex-row items-start gap-5">
              <img
                :src="store.user.avatar_url"
                :alt="`Avatar de ${store.user.name || store.user.login}`"
                class="w-20 h-20 rounded-full ring-2 ring-github-border shrink-0"
              >
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-3 mb-1">
                  <h2 class="text-xl font-bold text-github-text">
                    {{ store.user.name || store.user.login }}
                  </h2>
                  <a
                    :href="store.user.html_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    :aria-label="`Ver perfil de ${store.user.login} en GitHub (abre en nueva pestaña)`"
                    class="text-github-accent text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-github-accent focus:ring-offset-1 focus:ring-offset-github-surface rounded"
                  >
                    @{{ store.user.login }}
                  </a>
                </div>
                <p v-if="store.user.bio" class="text-github-muted text-sm mb-3">
                  {{ store.user.bio }}
                </p>
                <div class="flex flex-wrap gap-x-4 gap-y-1.5 text-github-muted text-xs">
                  <span v-if="store.user.company" class="flex items-center gap-1">
                    🏢 {{ store.user.company }}
                  </span>
                  <span v-if="store.user.location" class="flex items-center gap-1">
                    📍 {{ store.user.location }}
                  </span>
                  <span v-if="store.user.blog" class="flex items-center gap-1">
                    🔗
                    <a :href="blogUrl" target="_blank" rel="noopener noreferrer" class="text-github-accent hover:underline truncate max-w-48">
                      {{ store.user.blog }}
                    </a>
                  </span>
                  <span class="flex items-center gap-1">
                    📅 Desde {{ formatDate(store.user.created_at) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <DashboardStatsCard label="Repositorios" :value="store.user.public_repos" icon="📁" color="blue" />
            <DashboardStatsCard label="Estrellas" :value="store.totalStars" icon="⭐" color="yellow" />
            <DashboardStatsCard label="Forks" :value="store.totalForks" icon="🍴" color="green" />
            <DashboardStatsCard label="Seguidores" :value="store.user.followers" icon="👥" color="purple" />
          </div>

          <!-- Contribution Calendar -->
          <DashboardContribCalendar :calendar="contributions" class="mb-6" />

          <!-- Chart + Activity -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <DashboardLanguageChart :languages="store.languages" />
            <DashboardActivityFeed :events="events" />
          </div>

          <!-- Repos -->
          <section>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-github-text font-semibold">
                Repositorios
                <span class="ml-2 text-xs font-normal text-github-muted bg-github-border rounded-full px-2 py-0.5">
                  {{ store.repos.length }}
                </span>
              </h2>
            </div>
            <DashboardRepoList :repos="store.repos" />
          </section>
        </div>
      </Transition>

      <!-- Empty state -->
      <Transition name="fade">
        <div v-if="!isLoading && !store.user && !store.error" class="text-center py-24 text-github-muted">
          <svg class="mx-auto h-16 w-16 mb-4 opacity-30" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
          </svg>
          <p class="text-lg font-medium">
            Busca un usuario de GitHub
          </p>
          <p class="text-sm mt-1">
            Escribe un nombre de usuario para ver su perfil y repositorios
          </p>
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { ContributionCalendar, GitHubEvent } from '~/types/github'
import { formatDate } from '~/utils/github'

const route = useRoute()
const router = useRouter()
const store = useGitHubStore()
const { fetchAll, fetchLanguages, fetchEvents, fetchContributions } = useGitHub()

const events = ref<GitHubEvent[]>([])
const contributions = ref<ContributionCalendar | null>(null)
const loadingExtras = ref(false)
const copied = ref(false)

async function copyUrl() {
  await navigator.clipboard.writeText(window.location.href)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
const isLoading = computed(() => store.loading || loadingExtras.value)

const inputUsername = ref(route.query.user as string || '')

useHead(computed(() => ({
  title: store.user
    ? `${store.user.login} — GitHub Dashboard`
    : 'GitHub Dashboard',
  meta: [
    { name: 'description', content: 'Visualiza el perfil, repositorios y actividad de cualquier usuario de GitHub.' },
    { property: 'og:title', content: store.user ? `${store.user.login} — GitHub Dashboard` : 'GitHub Dashboard' },
    { property: 'og:description', content: 'Estadísticas y repositorios de GitHub en un solo lugar.' },
  ],
})))

const blogUrl = computed(() => {
  const blog = store.user?.blog ?? ''
  if (!blog)
    return ''
  return blog.startsWith('http') ? blog : `https://${blog}`
})

async function load(username: string) {
  const clean = username.trim()
  if (!clean || isLoading.value)
    return

  // Actualizar URL sin recargar la página
  await router.replace({ query: { user: clean } })

  events.value = []
  contributions.value = null
  await fetchAll(clean)

  if (store.repos.length) {
    loadingExtras.value = true
    const repoNames = store.repos.slice(0, 20).map(r => r.name)
    await Promise.all([
      fetchLanguages(clean, repoNames),
      fetchEvents(clean).then((e) => { events.value = e }).catch(() => {}),
      fetchContributions(clean).then((c) => { contributions.value = c }),
    ])
    loadingExtras.value = false
  }
}

const onSearch = () => load(inputUsername.value)

// Sincronizar si la URL cambia (navegación atrás/adelante)
watch(() => route.query.user, (user) => {
  if (!user) {
    inputUsername.value = ''
    return
  }
  if (user !== store.username) {
    inputUsername.value = user as string
    load(user as string)
  }
})

onMounted(() => {
  const user = route.query.user as string | undefined
  if (user)
    load(user)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
