import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { EnhancedTradovateAPI } from "@/lib/tradovate/enhanced-api"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // Test both demo and live environments
    const demoApi = new EnhancedTradovateAPI(true)
    const liveApi = new EnhancedTradovateAPI(false)

    const [demoHealth, liveHealth] = await Promise.all([
      demoApi.healthCheck().catch((e) => ({
        success: false,
        latency: 0,
        environment: "DEMO",
        error: e.message,
      })),
      liveApi.healthCheck().catch((e) => ({
        success: false,
        latency: 0,
        environment: "LIVE",
        error: e.message,
      })),
    ])

    const overallSuccess = demoHealth.success || liveHealth.success

    return NextResponse.json({
      success: overallSuccess,
      timestamp: new Date().toISOString(),
      environments: {
        demo: demoHealth,
        live: liveHealth,
      },
      message: overallSuccess ? "Tradovate API is accessible" : "Unable to reach Tradovate API",
    })
  } catch (error: any) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
