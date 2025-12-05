export function estimateEngagementRate(followers: number): number {
  if (followers < 10000) return 8
  if (followers < 50000) return 5
  if (followers < 100000) return 3
  if (followers < 500000) return 2
  return 1
}

export function estimateAverageLikes(followers: number, engagementRate: number): number {
  return Math.floor(followers * (engagementRate / 100) * 0.7)
}

export function estimateAverageComments(followers: number, engagementRate: number): number {
  return Math.floor(followers * (engagementRate / 100) * 0.3)
}

export function generateMockData(username: string): {
  followers: number
  engagementRate: number
} {
  const hash = username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const followers = Math.floor(10000 + ((hash * 1000) % 500000))
  const engagementRate = 2 + (hash % 10)

  return { followers, engagementRate }
}
