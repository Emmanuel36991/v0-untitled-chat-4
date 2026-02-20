import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { AlpacaClient, AlpacaApiError } from "@/lib/alpaca/client"
import type { AlpacaCredentials } from "@/types/alpaca"
import { logger } from "@/lib/logger"
import { encryptCredentials } from "@/lib/security/encryption"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiKey, secretKey, isPaper = true } = body

    if (!apiKey || !secretKey) {
      return NextResponse.json(
        { success: false, error: "API Key and Secret Key are required" },
        { status: 400 }
      )
    }

    // 1. Authenticate the Supabase user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated. Please log in." },
        { status: 401 }
      )
    }

    // 2. Verify credentials against Alpaca API
    const credentials: AlpacaCredentials = { apiKey, secretKey, isPaper }
    const client = new AlpacaClient(credentials)

    let account
    try {
      account = await client.getAccount()
    } catch (err) {
      if (err instanceof AlpacaApiError) {
        return NextResponse.json(
          { success: false, error: err.message, code: err.code },
          { status: err.statusCode === 401 ? 401 : 400 }
        )
      }
      throw err
    }

    logger.info(`Alpaca: Verified account ${account.account_number} (${account.status})`)

    if (account.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          error: `Alpaca account is not active (status: ${account.status}). Please check your account.`,
        },
        { status: 400 }
      )
    }

    // 3. Look up the "alpaca" broker in supported_brokers
    const { data: broker, error: brokerError } = await supabase
      .from("supported_brokers")
      .select("id")
      .eq("name", "alpaca")
      .single()

    if (brokerError || !broker) {
      logger.error("Alpaca broker not found in supported_brokers table", brokerError)
      return NextResponse.json(
        { success: false, error: "Alpaca broker configuration not found. Please contact support." },
        { status: 500 }
      )
    }

    // 4. Check for existing connection (upsert-safe)
    const { data: existingConnection } = await supabase
      .from("broker_connections")
      .select("id")
      .eq("user_id", user.id)
      .eq("broker_id", broker.id)
      .eq("account_id", account.account_number)
      .maybeSingle()

    let connectionId: string

    // Encrypt credentials before storing
    const encryptedCreds = encryptCredentials({ apiKey, secretKey, isPaper })

    if (existingConnection) {
      // Update existing connection
      const { error: updateError } = await supabase
        .from("broker_connections")
        .update({
          credentials: encryptedCreds,
          is_active: true,
          is_paper_trading: isPaper,
          status: "connected",
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingConnection.id)

      if (updateError) {
        logger.error("Failed to update Alpaca connection", updateError)
        return NextResponse.json(
          { success: false, error: "Failed to update broker connection" },
          { status: 500 }
        )
      }

      connectionId = existingConnection.id
      logger.info(`Alpaca: Updated existing connection ${connectionId}`)
    } else {
      // 5. Insert new broker_connections row
      const { data: connection, error: insertError } = await supabase
        .from("broker_connections")
        .insert({
          user_id: user.id,
          broker_id: broker.id,
          name: `Alpaca ${isPaper ? "Paper" : "Live"} - ${account.account_number}`,
          account_id: account.account_number,
          credentials: encryptedCreds,
          is_active: true,
          is_paper_trading: isPaper,
          status: "connected",
        })
        .select("id")
        .single()

      if (insertError || !connection) {
        logger.error("Failed to create Alpaca connection", insertError)
        return NextResponse.json(
          { success: false, error: "Failed to save broker connection" },
          { status: 500 }
        )
      }

      connectionId = connection.id
      logger.info(`Alpaca: Created new connection ${connectionId}`)
    }

    return NextResponse.json({
      success: true,
      connectionId,
      account: {
        id: account.id,
        accountNumber: account.account_number,
        status: account.status,
        currency: account.currency,
        buyingPower: account.buying_power,
        portfolioValue: account.portfolio_value,
        equity: account.equity,
        isPaper,
      },
    })
  } catch (error: any) {
    logger.error("Alpaca connect error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while connecting to Alpaca",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}
