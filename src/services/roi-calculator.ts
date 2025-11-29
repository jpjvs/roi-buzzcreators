import type { CampaignParams, CreatorResults } from "@/dtos/campaign"
import type { InstagramProfile } from "@/dtos/instagram"

export function calculateCreatorROI(profile: InstagramProfile, params: CampaignParams): CreatorResults {
  const estimated_views = Math.round(profile.followers * (params.engajamento / 100))
  const estimated_cost = estimated_views * params.cpv
  const estimated_sales = Math.round(estimated_views * (params.taxaConversao / 100))
  const estimated_revenue = estimated_sales * params.ticketMedio
  const estimated_roi = estimated_cost > 0 ? ((estimated_revenue - estimated_cost) / estimated_cost) * 100 : 0

  return {
    username: profile.username,
    followers: profile.followers,
    engagement_rate: profile.engagement_rate,
    estimated_views,
    estimated_cost,
    estimated_sales,
    estimated_revenue,
    estimated_roi,
  }
}

export function calculateTotals(results: CreatorResults[]) {
  return results.reduce(
    (acc, result) => ({
      total_cost: acc.total_cost + result.estimated_cost,
      total_revenue: acc.total_revenue + result.estimated_revenue,
      total_sales: acc.total_sales + result.estimated_sales,
      avg_roi: 0,
    }),
    { total_cost: 0, total_revenue: 0, total_sales: 0, avg_roi: 0 },
  )
}

