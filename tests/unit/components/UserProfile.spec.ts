import type { GitHubUser } from '../../../app/types/github'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UserProfile from '../../../app/components/dashboard/UserProfile.vue'

const BASE_USER: GitHubUser = {
  login: 'mikeljc-dev',
  name: 'Mikel',
  avatar_url: 'https://avatars.githubusercontent.com/u/1',
  bio: 'Frontend developer',
  company: 'Acme Corp',
  location: 'Madrid',
  blog: 'https://mikel.dev',
  twitter_username: null,
  public_repos: 20,
  followers: 100,
  following: 50,
  html_url: 'https://github.com/mikeljc-dev',
  created_at: '2020-01-15T00:00:00Z',
}

describe('userProfile', () => {
  it('renderiza el nombre y el login del usuario', () => {
    const wrapper = mount(UserProfile, { props: { user: BASE_USER } })
    expect(wrapper.text()).toContain('Mikel')
    expect(wrapper.text()).toContain('@mikeljc-dev')
  })

  it('muestra el nombre de usuario si no hay nombre', () => {
    const wrapper = mount(UserProfile, {
      props: { user: { ...BASE_USER, name: null } },
    })
    expect(wrapper.text()).toContain('mikeljc-dev')
  })

  it('renderiza la bio cuando existe', () => {
    const wrapper = mount(UserProfile, { props: { user: BASE_USER } })
    expect(wrapper.text()).toContain('Frontend developer')
  })

  it('no renderiza la bio si es null', () => {
    const wrapper = mount(UserProfile, {
      props: { user: { ...BASE_USER, bio: null } },
    })
    expect(wrapper.text()).not.toContain('Frontend developer')
  })

  it('muestra empresa cuando existe', () => {
    const wrapper = mount(UserProfile, { props: { user: BASE_USER } })
    expect(wrapper.text()).toContain('Acme Corp')
  })

  it('no muestra empresa si es null', () => {
    const wrapper = mount(UserProfile, {
      props: { user: { ...BASE_USER, company: null } },
    })
    expect(wrapper.text()).not.toContain('Acme Corp')
  })

  it('muestra ubicación cuando existe', () => {
    const wrapper = mount(UserProfile, { props: { user: BASE_USER } })
    expect(wrapper.text()).toContain('Madrid')
  })

  it('renderiza el avatar con alt descriptivo', () => {
    const wrapper = mount(UserProfile, { props: { user: BASE_USER } })
    const img = wrapper.find('img')
    expect(img.attributes('alt')).toContain('Mikel')
    expect(img.attributes('src')).toBe(BASE_USER.avatar_url)
  })

  it('el enlace al perfil de GitHub tiene aria-label descriptivo', () => {
    const wrapper = mount(UserProfile, { props: { user: BASE_USER } })
    const link = wrapper.find('a[href*="github.com"]')
    expect(link.attributes('aria-label')).toContain('mikeljc-dev')
  })

  it('prepend https:// al blog si no lo tiene', () => {
    const wrapper = mount(UserProfile, {
      props: { user: { ...BASE_USER, blog: 'mikel.dev' } },
    })
    const blogLink = wrapper.find('a[href*="mikel.dev"]')
    expect(blogLink.attributes('href')).toBe('https://mikel.dev')
  })

  it('no modifica el blog si ya tiene https://', () => {
    const wrapper = mount(UserProfile, { props: { user: BASE_USER } })
    const blogLink = wrapper.find('a[href*="mikel.dev"]')
    expect(blogLink.attributes('href')).toBe('https://mikel.dev')
  })

  it('no muestra sección de blog si es null', () => {
    const wrapper = mount(UserProfile, {
      props: { user: { ...BASE_USER, blog: null } },
    })
    expect(wrapper.find('a[href*="mikel.dev"]').exists()).toBe(false)
  })
})
