import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useLanguages } from '../../../app/composables/useLanguages'
import { LANG_COLORS } from '../../../app/utils/github'

describe('useLanguages — chartData', () => {
  it('devuelve arrays vacíos para un mapa vacío', () => {
    const { chartData } = useLanguages(ref({}))
    expect(chartData.value.labels).toHaveLength(0)
    expect(chartData.value.data).toHaveLength(0)
    expect(chartData.value.colors).toHaveLength(0)
  })

  it('ordena por bytes de mayor a menor', () => {
    const { chartData } = useLanguages(ref({
      JavaScript: 1000,
      TypeScript: 5000,
      Python: 2000,
    }))
    expect(chartData.value.labels[0]).toBe('TypeScript')
    expect(chartData.value.labels[1]).toBe('Python')
    expect(chartData.value.labels[2]).toBe('JavaScript')
  })

  it('limita a 6 lenguajes y agrupa el resto en "Otros"', () => {
    const langs: Record<string, number> = {
      TypeScript: 7000,
      JavaScript: 6000,
      Python: 5000,
      Go: 4000,
      Rust: 3000,
      Vue: 2000,
      Ruby: 1500,
      PHP: 500,
    }
    const { chartData } = useLanguages(ref(langs))
    expect(chartData.value.labels).toHaveLength(7) // 6 + Otros
    expect(chartData.value.labels).toContain('Otros')
    const othersIdx = chartData.value.labels.indexOf('Otros')
    expect(chartData.value.data[othersIdx]).toBe(1500 + 500)
  })

  it('no añade "Otros" cuando hay 6 lenguajes o menos', () => {
    const { chartData } = useLanguages(ref({
      TypeScript: 5000,
      JavaScript: 3000,
    }))
    expect(chartData.value.labels).not.toContain('Otros')
  })

  it('asigna colores correctos a lenguajes conocidos', () => {
    const { chartData } = useLanguages(ref({ TypeScript: 1000, Vue: 500 }))
    const tsIdx = chartData.value.labels.indexOf('TypeScript')
    const vueIdx = chartData.value.labels.indexOf('Vue')
    expect(chartData.value.colors[tsIdx]).toBe(LANG_COLORS['TypeScript'])
    expect(chartData.value.colors[vueIdx]).toBe(LANG_COLORS['Vue'])
  })

  it('asigna color gris a lenguajes desconocidos', () => {
    const { chartData } = useLanguages(ref({ CobolScript: 1000 }))
    expect(chartData.value.colors[0]).toBe('#8b949e')
  })

  it('el color de "Otros" es siempre #444c56', () => {
    const langs: Record<string, number> = {}
    ;['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach((k, i) => { langs[k] = 1000 - i * 100 })
    const { chartData } = useLanguages(ref(langs))
    const othersIdx = chartData.value.labels.indexOf('Otros')
    expect(chartData.value.colors[othersIdx]).toBe('#444c56')
  })

  it('es reactivo — actualiza cuando cambia el mapa de lenguajes', async () => {
    const langs = ref<Record<string, number>>({ TypeScript: 1000 })
    const { chartData } = useLanguages(langs)
    expect(chartData.value.labels).toContain('TypeScript')

    langs.value = { Python: 2000, Go: 1000 }
    await Promise.resolve()
    expect(chartData.value.labels).toContain('Python')
    expect(chartData.value.labels).not.toContain('TypeScript')
  })
})
