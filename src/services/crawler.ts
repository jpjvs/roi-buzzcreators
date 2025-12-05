import type {
  CrawlerPublicProfileRequest,
  CrawlerPublicProfileResponse,
  CrawlerApiError,
} from "@/dtos/crawler"
import type { InstagramPublicData } from "@/dtos/instagram"

export class CrawlerService {
  private baseUrl: string
  private jwtToken: string | undefined

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_CRAWLER_API_URL || "http://localhost:8000"
    this.jwtToken = process.env.CRAWLER_JWT_TOKEN
  }

  isConfigured(): boolean {
    return !!this.jwtToken
  }

  async fetchPublicProfile(username: string): Promise<InstagramPublicData> {
    if (!this.jwtToken) {
      throw new Error("Crawler JWT token not configured")
    }

    const cleanUsername = username.replace("@", "")

    const requestBody: CrawlerPublicProfileRequest = {
      username: cleanUsername,
      platform: "instagram",
    }

    const response = await fetch(`${this.baseUrl}/roi/instagram/public-profile/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.jwtToken}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData: CrawlerApiError = await response.json().catch(() => ({}))
      throw new Error(
        `Crawler API error (${response.status}): ${errorData.error || "Unknown error"}`,
      )
    }

    const data: CrawlerPublicProfileResponse = await response.json()

    return {
      username: data.username,
      followers_count: data.followers_count,
      follows_count: data.follows_count,
      media_count: data.media_count,
    }
  }

  async fetchMultipleProfiles(usernames: string[]): Promise<InstagramPublicData[]> {
    return Promise.all(usernames.map((username) => this.fetchPublicProfile(username)))
  }
}

export const crawlerService = new CrawlerService()
