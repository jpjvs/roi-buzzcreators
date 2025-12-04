import { type NextRequest, NextResponse } from "next/server"
import { fetchMultipleProfiles } from "@/services/instagram"

export async function POST(request: NextRequest) {
  try {
    const { usernames } = await request.json()

    if (!Array.isArray(usernames) || usernames.length === 0) {
      return NextResponse.json({ error: "Invalid usernames array" }, { status: 400 })
    }

    if (usernames.length > 5) {
      return NextResponse.json({ error: "Maximum 5 profiles allowed" }, { status: 400 })
    }

    const profiles = await fetchMultipleProfiles(usernames)

    return NextResponse.json({ profiles })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 })
  }
}
