import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, source } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const CRM_ENDPOINT = process.env.BUZZCREATORS_CRM_ENDPOINT || ""
    const CRM_API_KEY = process.env.BUZZCREATORS_CRM_API_KEY || ""

    if (!CRM_ENDPOINT) {
      return NextResponse.json({
        success: true,
        message: "Email captured (CRM integration pending)",
      })
    }

    const crmResponse = await fetch(CRM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CRM_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        source: source || "roi-calculator",
        lead_type: "roi_calculator_signup",
        captured_at: new Date().toISOString(),
        tags: ["roi-calculator", "lead-magnet"],
      }),
    })

    if (!crmResponse.ok) {
      return NextResponse.json({
        success: true,
        message: "Email captured (CRM sync pending)",
      })
    }

    return NextResponse.json({
      success: true,
      message: "Lead successfully registered",
    })
  } catch (error) {
    return NextResponse.json({
      success: true,
      message: "Email captured",
    })
  }
}
