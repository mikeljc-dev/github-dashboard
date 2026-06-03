export interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
  bio: string | null
  company: string | null
  location: string | null
  blog: string | null
  twitter_username: string | null
  public_repos: number
  followers: number
  following: number
  html_url: string
  created_at: string
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  updated_at: string
  topics: string[]
  fork: boolean
  archived: boolean
}

export type LanguageMap = Record<string, number>

export interface GitHubEvent {
  id: string
  type: string
  created_at: string
  repo: { name: string, url: string }
  payload: Record<string, unknown>
}
