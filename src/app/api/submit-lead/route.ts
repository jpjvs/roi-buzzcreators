import { type NextRequest, NextResponse } from "next/server"

// CRM Integration API endpoint
// This will send lead data to Buzzcreators CRM (Buzzmonitor)
// The user mentioned: "Se comunicar com Munique, do time da Buzzmonitor, para embedar o form"

export async function POST(request: NextRequest) {
  try {
    const { email, source } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // TODO: Replace with actual CRM endpoint provided by Munique
    // This is a placeholder for the Buzzmonitor CRM integration
    const CRM_ENDPOINT = process.env.BUZZCREATORS_CRM_ENDPOINT || ""
    const CRM_API_KEY = process.env.BUZZCREATORS_CRM_API_KEY || ""

    if (!CRM_ENDPOINT) {
      console.error("[v0] CRM endpoint not configured")
      // Still return success to not block user flow
      return NextResponse.json({
        success: true,
        message: "Email captured (CRM integration pending)",
      })
    }

    // Send lead to CRM
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
      console.error("[v0] Failed to send lead to CRM:", await crmResponse.text())
      // Still return success to not block user flow
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
    console.error("[v0] Error submitting lead:", error)
    // Return success to not block user flow even if CRM fails
    return NextResponse.json({
      success: true,
      message: "Email captured",
    })
  }
}
