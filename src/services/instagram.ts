import type { InstagramProfile } from "@/dtos/instagram"

export async function fetchInstagramProfile(username: string): Promise<InstagramProfile> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const hash = username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const followers = Math.floor(10000 + ((hash * 1000) % 500000))
  const engagement = 2 + (hash % 10)

  return {
    username,
    followers,
    engagement_rate: engagement,
    avg_likes: Math.floor(followers * (engagement / 100) * 0.7),
    avg_comments: Math.floor(followers * (engagement / 100) * 0.3),
  }
}

export async function fetchMultipleProfiles(usernames: string[]): Promise<InstagramProfile[]> {
  return Promise.all(usernames.map((username) => fetchInstagramProfile(username)))
}

