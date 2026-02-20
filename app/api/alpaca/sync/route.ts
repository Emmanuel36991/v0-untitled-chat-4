import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { AlpacaClient, AlpacaApiError, mapAlpacaOrderToTrade } from "@/lib/alpaca/client"
import type { AlpacaCredentials } from "@/types/alpaca"
import { logger } from "@/lib/logger"
import { decryptCredentials } from "@/lib/security/encryption"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { connectionId } = body

    if (!connectionId) {
      return NextResponse.json(
        { success: false, error: "Connection ID is required" },
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

    // 2. Read the broker_connections row
    const { data: connection, error: connError } = await supabase
      .from("broker_connections")
      .select("id, credentials, is_paper_trading, last_sync_at, account_id")
      .eq("id", connectionId)
      .eq("user_id", user.id)
      .single()

    if (connError || !connection) {
      return NextResponse.json(
        { success: false, error: "Broker connection not found" },
        { status: 404 }
      )
    }

    // Decrypt credentials from DB (stored as AES-256-GCM encrypted string)
    let credentials: AlpacaCredentials
    if (typeof connection.credentials === "string") {
      // New format: encrypted string
      credentials = decryptCredentials<AlpacaCredentials>(connection.credentials)
    } else {
      // Legacy format: plain JSON (migrate on next connect)
      credentials = connection.credentials as AlpacaCredentials
    }

    // 3. Update connection status to syncing
    await supabase
      .from("broker_connections")
      .update({ status: "syncing", updated_at: new Date().toISOString() })
      .eq("id", connectionId)

    // 4. Create a sync log entry
    const { data: syncLog, error: syncLogError } = await supabase
      .from("broker_sync_logs")
      .insert({
        connection_id: connectionId,
        sync_type: "manual",
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    const syncLogId = syncLog?.id

    try {
      // 5. Fetch orders from Alpaca
      const client = new AlpacaClient(credentials)

      // Only fetch orders after the last sync to avoid duplicates
      const fetchParams: { after?: string } = {}
      if (connection.last_sync_at) {
        fetchParams.after = connection.last_sync_at
      }

      logger.info(`Alpaca sync: Fetching orders${connection.last_sync_at ? ` after ${connection.last_sync_at}` : " (full history)"}`)

      const orders = await client.getAllClosedOrders(fetchParams)
      logger.info(`Alpaca sync: Fetched ${orders.length} closed orders`)

      // 6. Map orders to trades, filtering for filled only
      const trades = orders
        .map(mapAlpacaOrderToTrade)
        .filter((t): t is NonNullable<typeof t> => t !== null)

      logger.info(`Alpaca sync: ${trades.length} filled orders to import`)

      if (trades.length === 0) {
        // No new trades to import
        if (syncLogId) {
          await supabase
            .from("broker_sync_logs")
            .update({
              status: "success",
              trades_synced: 0,
              trades_skipped: orders.length,
              completed_at: new Date().toISOString(),
              sync_duration_ms: 0,
            })
            .eq("id", syncLogId)
        }

        await supabase
          .from("broker_connections")
          .update({
            status: "connected",
            last_sync_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", connectionId)

        return NextResponse.json({
          success: true,
          tradesImported: 0,
          tradesSkipped: orders.length,
          message: "No new filled orders to import",
        })
      }

      // 7. Check for existing broker_trades to avoid duplicates
      const orderIds = orders
        .filter(o => o.status === "filled")
        .map(o => o.id)

      const { data: existingBrokerTrades } = await supabase
        .from("broker_trades")
        .select("broker_trade_id")
        .eq("connection_id", connectionId)
        .in("broker_trade_id", orderIds)

      const existingIds = new Set(
        (existingBrokerTrades || []).map(bt => bt.broker_trade_id)
      )

      // Filter out already-imported orders
      const filledOrders = orders.filter(o => o.status === "filled")
      const newOrders = filledOrders.filter(o => !existingIds.has(o.id))
      const newTrades = newOrders
        .map(mapAlpacaOrderToTrade)
        .filter((t): t is NonNullable<typeof t> => t !== null)

      const skippedCount = filledOrders.length - newOrders.length

      if (newTrades.length === 0) {
        if (syncLogId) {
          await supabase
            .from("broker_sync_logs")
            .update({
              status: "success",
              trades_synced: 0,
              trades_skipped: skippedCount,
              completed_at: new Date().toISOString(),
            })
            .eq("id", syncLogId)
        }

        await supabase
          .from("broker_connections")
          .update({
            status: "connected",
            last_sync_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", connectionId)

        return NextResponse.json({
          success: true,
          tradesImported: 0,
          tradesSkipped: skippedCount,
          message: "All orders have already been imported",
        })
      }

      // 8. Insert trades into the trades table
      const dbTrades = newTrades.map(trade => ({
        user_id: user.id,
        date: trade.date,
        instrument: trade.instrument,
        direction: trade.direction,
        entry_price: trade.entry_price,
        exit_price: trade.exit_price,
        stop_loss: trade.stop_loss,
        size: trade.size,
        pnl: trade.pnl ?? 0,
        outcome: trade.outcome ?? "breakeven",
        notes: trade.notes,
      }))

      const { data: insertedTrades, error: insertError } = await supabase
        .from("trades")
        .insert(dbTrades)
        .select("id")

      if (insertError) {
        logger.error("Alpaca sync: Failed to insert trades", insertError)
        throw new Error(`Failed to insert trades: ${insertError.message}`)
      }

      const insertedCount = insertedTrades?.length || 0
      logger.info(`Alpaca sync: Inserted ${insertedCount} trades`)

      // 9. Create broker_trades mapping rows
      if (insertedTrades && insertedTrades.length > 0) {
        const brokerTradeRows = insertedTrades.map((inserted, index) => ({
          connection_id: connectionId,
          trade_id: inserted.id,
          broker_trade_id: newOrders[index].id,
          broker_order_id: newOrders[index].client_order_id,
          raw_data: newOrders[index],
        }))

        const { error: btError } = await supabase
          .from("broker_trades")
          .insert(brokerTradeRows)

        if (btError) {
          logger.warn("Alpaca sync: Failed to create broker_trades mappings (trades were still imported)", btError)
        }
      }

      // 10. Update sync log and connection
      const completedAt = new Date().toISOString()

      if (syncLogId) {
        await supabase
          .from("broker_sync_logs")
          .update({
            status: "success",
            trades_synced: insertedCount,
            trades_skipped: skippedCount,
            completed_at: completedAt,
          })
          .eq("id", syncLogId)
      }

      await supabase
        .from("broker_connections")
        .update({
          status: "connected",
          last_sync_at: completedAt,
          total_trades_synced: (connection as any).total_trades_synced
            ? (connection as any).total_trades_synced + insertedCount
            : insertedCount,
          updated_at: completedAt,
        })
        .eq("id", connectionId)

      return NextResponse.json({
        success: true,
        tradesImported: insertedCount,
        tradesSkipped: skippedCount,
        message: `Successfully imported ${insertedCount} trade${insertedCount === 1 ? "" : "s"} from Alpaca`,
      })
    } catch (syncError: any) {
      // Update sync log and connection on failure
      const errorMessage = syncError instanceof AlpacaApiError
        ? syncError.message
        : syncError.message || "Sync failed"

      if (syncLogId) {
        await supabase
          .from("broker_sync_logs")
          .update({
            status: "error",
            error_message: errorMessage,
            completed_at: new Date().toISOString(),
          })
          .eq("id", syncLogId)
      }

      await supabase
        .from("broker_connections")
        .update({
          status: "error",
          error_message: errorMessage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", connectionId)

      throw syncError
    }
  } catch (error: any) {
    logger.error("Alpaca sync error:", error)

    if (error instanceof AlpacaApiError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode >= 400 && error.statusCode < 500 ? error.statusCode : 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred during sync",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
