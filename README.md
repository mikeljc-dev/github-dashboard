# GitHub Dashboard

> Visualiza el perfil, repositorios y actividad de cualquier usuario de GitHub en un dashboard moderno y accesible.

[![CI](https://github.com/mikeljc-dev/github-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/mikeljc-dev/github-dashboard/actions/workflows/ci.yml)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vitest](https://img.shields.io/badge/Vitest-89%25_coverage-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![Playwright](https://img.shields.io/badge/E2E-Playwright-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)

---

## Demo en vivo

🔗 **[github-dashboard-nqirascw7-mikeljc-devs-projects.vercel.app](https://github-dashboard-nqirascw7-mikeljc-devs-projects.vercel.app)**

![Dashboard preview](docs/screenshot.png)

---

## Características

- 🔍 **URL shareable** — `/?user=mikeljc-dev` carga directamente el perfil, bookmarkable y compartible
- 👤 **Perfil completo** — avatar, bio, empresa, ubicación, web y fecha de registro
- 📊 **Métricas** — repositorios públicos, estrellas acumuladas, forks y seguidores
- 📅 **Calendario de contribuciones** — heatmap del último año vía GitHub GraphQL API
- 🌐 **Gráfico de lenguajes** — top 6 lenguajes con Chart.js (doughnut)
- 📂 **Lista de repositorios** — búsqueda, filtros por lenguaje, ordenamiento, topics, exclusión de forks
- 🕒 **Actividad reciente** — últimos 10 eventos públicos con iconos por tipo
- 📡 **Rate limit** — peticiones restantes a la API con código de color en tiempo real
- 🔗 **Botón compartir** — copia la URL del perfil al portapapeles
- ⚡ **Caché en dos capas** — HTTP `Cache-Control` en servidor + `sessionStorage` con TTL de 5 min
- 🔄 **Retry automático** — reintentos con backoff lineal en errores de red y 5xx
- ♿ **Accesible** — WCAG 2.1 AA, skip link, `aria-live`, `role="alert"`, navegación por teclado
- 🔒 **Seguro** — token nunca expuesto al cliente, proxy server-side, headers de seguridad

---

## Stack tecnológico

| Capa       | Tecnología                      | Por qué                                                   |
| ---------- | ------------------------------- | --------------------------------------------------------- |
| Framework  | **Nuxt 4** (Vue 3)              | SSR nativo, server routes como proxy, file-based routing  |
| Lenguaje   | **TypeScript** (strict)         | Tipado estricto sin `any`, interfaces completas de la API |
| Estilos    | **Tailwind CSS v3**             | Utility-first, sin CSS muerto en producción               |
| Gráficas   | **Chart.js + vue-chartjs**      | Ligero, bien mantenido, `<ClientOnly>` para SSR           |
| Estado     | **Pinia**                       | Setup syntax, computed para datos derivados               |
| Utilidades | **VueUse**                      | `useDebounceFn` para búsqueda reactiva                    |
| Testing    | **Vitest + Playwright**         | 80 tests unitarios (89% cobertura) + 9 E2E                |
| CI/CD      | **GitHub Actions + Vercel**     | Deploy automático en merge a `main`                       |
| Calidad    | **ESLint + Commitlint + Husky** | Conventional commits, lint en pre-commit                  |

---

## Técnicas aplicadas

| Área              | Detalle                                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Arquitectura**  | Separación por dominio: `components/`, `composables/`, `utils/`, `server/` con responsabilidad única por archivo |
| **TypeScript**    | Strict mode, generics en `pLimit<T>` y `readCache<T>`, type guards, interfaces completas de la GitHub API        |
| **Vue 3**         | `<script setup>`, Pinia setup syntax, composables puros, componentes de iconos SVG reutilizables                 |
| **Nuxt / SSR**    | Server routes como proxy seguro, `runtimeConfig` server-only, `useHead` reactivo                                 |
| **Seguridad**     | Token nunca expuesto al cliente, validación con regex en server, security headers en todas las rutas             |
| **Rendimiento**   | Caché en dos capas con TTL, `AbortController`, `pLimit` propio (concurrencia máx. 8), retry con backoff          |
| **Accesibilidad** | Skip link, `aria-live="polite"`, `role="alert"`, `aria-busy`, navegación completa por teclado                    |
| **Testing**       | Mocks de `$fetch` y `sessionStorage`, stub de `<ClientOnly>`, tests de componente con Vue Test Utils             |
| **DevOps**        | GitHub Actions (lint → typecheck → coverage → build), Vercel deploy, commitlint + Husky                          |

---

## Arquitectura

### Proxy server-side (seguridad)

El token de GitHub **nunca llega al cliente**. Todas las llamadas pasan por server routes de Nuxt:

```
Browser → /api/github/user?username=X → Nuxt Server → api.github.com (con token)
```

El servidor añade `Authorization: Bearer <token>` y devuelve solo los datos necesarios.

### Caché en dos capas

```
Request → sessionStorage (TTL 5min) ──→ HIT: respuesta inmediata
                                    └──→ MISS: /api/github/* → Cache-Control → GitHub API
```

- **Server**: `Cache-Control: public, max-age=300` (repos/usuario) — CDN cachea entre usuarios
- **Client**: `sessionStorage` con TTL de 5 minutos — evita re-fetches al navegar

### Retry con backoff lineal

Solo reintenta en errores de red o 5xx — nunca en 4xx (error del cliente):

```
Intento 1 → falla → espera 500ms → Intento 2 → falla → espera 1000ms → Intento 3
```

### Cancelación de requests

`AbortController` cancela la búsqueda anterior si el usuario inicia una nueva antes de que termine.

### Concurrencia limitada

`fetchLanguages` hace hasta 20 peticiones (una por repo). `pLimit` propio con máximo de **8 requests paralelos** para no saturar la API.

---

## Instalación y desarrollo local

### Prerequisitos

- Node.js >= 22
- npm >= 9
- Una cuenta de GitHub (para el token)

### 1. Clonar el repositorio

```bash
git clone https://github.com/mikeljc-dev/github-dashboard.git
cd github-dashboard
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tu token de GitHub:

```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

#### Cómo obtener el token

1. Ve a **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Haz clic en **Generate new token (classic)**
3. Nombre: `github-dashboard`
4. Scope: marca solo **`read:user`**
5. Copia el token generado y pégalo en `.env`

> **Sin token**: el dashboard funciona con límite de 60 req/hora. Con token: 5.000 req/hora.

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
# → http://localhost:3000
```

---

## Scripts disponibles

```bash
npm run dev           # Servidor de desarrollo
npm run build         # Build de producción
npm run preview       # Preview del build
npm run typecheck     # Comprobación de tipos TypeScript
npm run lint          # ESLint + Prettier
npm run test          # Tests unitarios (Vitest)
npm run test:watch    # Tests en modo watch
npm run test:coverage # Tests con informe de cobertura
npm run test:e2e      # Tests E2E (Playwright) — requiere servidor corriendo
```

---

## Tests

### Unitarios — 80 tests, cobertura 89%

```bash
npm run test
npm run test:coverage
```

| Archivo                              | Tests | Cubre                                                          |
| ------------------------------------ | ----- | -------------------------------------------------------------- |
| `utils/github.spec.ts`               | 15    | `timeAgo`, `formatDate`, `langColor`, `LANG_COLORS`            |
| `utils/async.spec.ts`                | 10    | `pLimit` (concurrencia, fallos), `withRetry` (retry, 4xx, 5xx) |
| `utils/cache.spec.ts`                | 7     | `readCache`/`writeCache` con TTL, `clearCache` por prefijo     |
| `composables/useRepos.spec.ts`       | 14    | filtros, ordenamiento, búsqueda debounced                      |
| `composables/useLanguages.spec.ts`   | 8     | chartData, colores, "Otros", reactividad                       |
| `composables/useGitHub.spec.ts`      | 7     | caché, errores HTTP, cancelación, loading state                |
| `components/UserProfile.spec.ts`     | 11    | renderizado, campos opcionales, alt, aria-label                |
| `components/ContribCalendar.spec.ts` | 7     | contribuciones, null, celdas, leyenda                          |

### E2E — 9 tests con Playwright

```bash
npm run dev          # en una terminal
npm run test:e2e     # en otra terminal
```

Cubre el flujo principal: estado vacío → búsqueda → perfil → stats → filtrado → error handling → scroll.

---

## Estructura del proyecto

```
github-dashboard/
├── app/
│   ├── components/
│   │   ├── dashboard/        # UserProfile, StatsCard, RepoList, RepoCard,
│   │   │                     # LanguageChart, ActivityFeed, ContribCalendar
│   │   ├── ui/               # Skeleton, ErrorBanner, SearchInput, RateLimitBadge
│   │   └── icons/            # IconGitHub, IconStar, IconFork, IconSearch...
│   ├── composables/          # useGitHub, useRepos, useLanguages
│   ├── pages/index.vue       # Dashboard principal
│   ├── stores/github.ts      # Estado global (Pinia)
│   ├── types/github.d.ts     # Interfaces de la GitHub API
│   └── utils/
│       ├── github.ts         # timeAgo, formatDate, langColor, LANG_COLORS
│       ├── constants.ts      # MAX_REPOS_FOR_LANGUAGES, CACHE_TTL_MS...
│       ├── async.ts          # pLimit, withRetry
│       └── cache.ts          # readCache, writeCache, clearCache
├── server/
│   ├── api/github/           # user, repos, events, languages, contributions, rate-limit
│   └── utils/github.ts       # Cliente compartido, validación, errores tipados
├── tests/
│   ├── unit/                 # Vitest — composables, utils y componentes
│   └── e2e/                  # Playwright — flujo completo
└── .github/workflows/ci.yml  # lint → typecheck → coverage → build
```

---

## Variables de entorno

| Variable       | Descripción                     | Requerida   |
| -------------- | ------------------------------- | ----------- |
| `GITHUB_TOKEN` | Personal Access Token de GitHub | Recomendada |

> Consulta `.env.example` para la plantilla completa.

---

## Deploy en Vercel

```bash
npm install -g vercel
vercel
```

Añade `GITHUB_TOKEN` en **Vercel → Project → Settings → Environment Variables**.

---

## Decisiones de arquitectura

**¿Por qué Nuxt en vez de Vite puro?**
Las server routes permiten ocultar el token de GitHub al cliente sin necesitar un backend separado. El SSR mejora el LCP y el SEO.

**¿Por qué Pinia en vez de composables globales?**
El store centraliza el estado de carga, error y datos. Los composables son para lógica de fetching y transformación, no para estado compartido.

**¿Por qué `sessionStorage` con TTL propio y no `useState` de Nuxt?**
`useState` se pierde al recargar. `sessionStorage` persiste entre navegaciones dentro de la misma sesión con TTL configurable.

**¿Por qué `$fetch` manual y no `useAsyncData`?**
Los datos dependen del input del usuario (username), no de la ruta. `useAsyncData` está optimizado para datos ligados a la URL. `$fetch` con gestión manual da más control sobre caché, cancelación y retry.

**¿Por qué `pLimit` propio y no una librería?**
Son 15 líneas, sin dependencia extra, completamente testeable y adaptado exactamente a lo que se necesita.

---

## Licencia

MIT © [mikeljc-dev](https://github.com/mikeljc-dev)
