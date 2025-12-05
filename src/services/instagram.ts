import type { InstagramProfile } from "@/dtos/instagram";
import { crawlerService } from "./crawler";
import {
  estimateEngagementRate,
  estimateAverageLikes,
  estimateAverageComments,
  generateMockData,
} from "./instagram-estimator";

export async function fetchInstagramProfile(
  username: string
): Promise<InstagramProfile> {
  try {
    if (!crawlerService.isConfigured()) {
      return buildMockProfile(username);
    }

    const publicData = await crawlerService.fetchPublicProfile(username);
    const followers = publicData.followers_count;
    const engagementRate = estimateEngagementRate(followers);
    const avgLikes = estimateAverageLikes(followers, engagementRate);
    const avgComments = estimateAverageComments(followers, engagementRate);

    return {
      username: publicData.username,
      followers,
      engagement_rate: engagementRate,
      avg_likes: avgLikes,
      avg_comments: avgComments,
    };
  } catch (error) {
    return buildMockProfile(username);
  }
}

export async function fetchMultipleProfiles(
  usernames: string[]
): Promise<InstagramProfile[]> {
  return Promise.all(
    usernames.map((username) => fetchInstagramProfile(username))
  );
}

function buildMockProfile(username: string): InstagramProfile {
  const mockData = generateMockData(username);

  return {
    username,
    followers: mockData.followers,
    engagement_rate: mockData.engagementRate,
    avg_likes: estimateAverageLikes(
      mockData.followers,
      mockData.engagementRate
    ),
    avg_comments: estimateAverageComments(
      mockData.followers,
      mockData.engagementRate
    ),
  };
}
