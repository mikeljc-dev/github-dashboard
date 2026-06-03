import type { ContributionCalendar } from '../../../app/types/github'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ContribCalendar from '../../../app/components/dashboard/ContribCalendar.vue'

// Stub ClientOnly para que renderice su contenido en el entorno de test
const stubs = { ClientOnly: { template: '<slot />' } }

function makeCalendar(totalContributions: number, weeks = 4): ContributionCalendar {
  return {
    totalContributions,
    weeks: Array.from({ length: weeks }, (_, wi) => ({
      contributionDays: Array.from({ length: 7 }, (_, di) => ({
        date: `2024-0${wi + 1}-0${di + 1}`,
        contributionCount: di * wi,
        color: di === 0 ? '#ebedf0' : '#26a641',
      })),
    })),
  }
}

describe('contribCalendar', () => {
  it('muestra el total de contribuciones', () => {
    const wrapper = mount(ContribCalendar, {
      props: { calendar: makeCalendar(432) },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('432')
  })

  it('muestra 0 contribuciones cuando el calendar es null', () => {
    const wrapper = mount(ContribCalendar, {
      props: { calendar: null },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('0')
  })

  it('muestra el texto "en el último año"', () => {
    const wrapper = mount(ContribCalendar, {
      props: { calendar: makeCalendar(100) },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('en el último año')
  })

  it('muestra el título "Contribuciones"', () => {
    const wrapper = mount(ContribCalendar, {
      props: { calendar: makeCalendar(50) },
      global: { stubs },
    })
    expect(wrapper.find('h2').text()).toContain('Contribuciones')
  })

  it('renderiza celdas para cada día de contribución', () => {
    const wrapper = mount(ContribCalendar, {
      props: { calendar: makeCalendar(10, 2) },
      global: { stubs },
    })
    const cells = wrapper.findAll('[style*="background"]')
    expect(cells.length).toBeGreaterThan(0)
  })

  it('muestra la leyenda de colores', () => {
    const wrapper = mount(ContribCalendar, {
      props: { calendar: makeCalendar(200) },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Menos')
    expect(wrapper.text()).toContain('Más')
  })

  it('muestra el número correcto de semanas', () => {
    const weeks = 6
    const wrapper = mount(ContribCalendar, {
      props: { calendar: makeCalendar(10, weeks) },
      global: { stubs },
    })
    // 6 semanas × 7 días = 42 celdas con style background
    const cells = wrapper.findAll('[title*="contribuciones"]')
    expect(cells.length).toBe(weeks * 7)
  })
})
