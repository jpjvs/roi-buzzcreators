export interface CrawlerPublicProfileResponse {
  id: number
  platform: string
  username: string
  followers_count: number
  follows_count: number
  media_count: number
  last_synced_at: string | null
}

export interface CrawlerPublicProfileRequest {
  username: string
  platform?: string
}

export interface CrawlerApiError {
  error?: string
  [key: string]: unknown
}
