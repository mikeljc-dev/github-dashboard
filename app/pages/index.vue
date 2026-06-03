<template>
  <div class="min-h-screen bg-github-dark">
    <!-- Navbar -->
    <nav class="sticky top-0 z-10 border-b border-github-border bg-github-dark/80 backdrop-blur-md">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-2.5 text-github-text font-semibold">
          <IconsIconGitHub class="h-6 w-6" />
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
              <IconsIconShare v-if="!copied" class="h-4 w-4" />
              <IconsIconCheck v-else class="h-4 w-4 text-github-green" />
              <span>{{ copied ? '¡Copiado!' : 'Compartir' }}</span>
            </button>
          </Transition>
          <UiRateLimitBadge :rate-limit="rateLimit" />
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
          <DashboardUserProfile :user="store.user" class="mb-6" />

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
          <IconsIconGitHub class="mx-auto h-16 w-16 mb-4 opacity-30" />
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
import type { ContributionCalendar, GitHubEvent, RateLimit } from '~/types/github'
import { MAX_REPOS_FOR_LANGUAGES } from '~/utils/constants'

const route = useRoute()
const router = useRouter()
const store = useGitHubStore()
const { fetchAll, fetchLanguages, fetchEvents, fetchContributions } = useGitHub()

const events = ref<GitHubEvent[]>([])
const contributions = ref<ContributionCalendar | null>(null)
const rateLimit = ref<RateLimit | null>(null)
const loadingExtras = ref(false)
const copied = ref(false)

async function fetchRateLimit() {
  try {
    rateLimit.value = await $fetch<RateLimit>('/api/github/rate-limit')
  }
  catch { /* silencioso — no crítico */ }
}

async function copyUrl() {
  await navigator.clipboard.writeText(window.location.href)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
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
    const repoNames = store.repos.slice(0, MAX_REPOS_FOR_LANGUAGES).map(r => r.name)
    await Promise.all([
      fetchLanguages(clean, repoNames),
      fetchEvents(clean).then(e => (events.value = e)).catch(() => {}),
      fetchContributions(clean).then(c => (contributions.value = c)),
      fetchRateLimit(),
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
