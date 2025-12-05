"use server"

import { createClient } from "@/lib/supabase/server"
import type { InstrumentPopularity, InstrumentSentiment, SetupPopularity } from "@/types/social-insights"

export async function getInstrumentPopularity(limit = 5, periodDays = 30): Promise<InstrumentPopularity[]> {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.rpc("get_instrument_popularity", {
      limit_count: limit,
      period_days: periodDays,
    })

    if (error) {
      console.error("Error fetching instrument popularity via RPC:", error.message)
      if (
        error.code === "42883" ||
        error.message.includes("does not exist") ||
        error.message.includes("could not find the function")
      ) {
        console.warn(
          "RPC function 'get_instrument_popularity' not found. Please ensure the database migration script (002-create-social-insights-functions.sql) has been run successfully in your Supabase SQL Editor.",
        )
      }
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Exception in getInstrumentPopularity:", error)
    return []
  }
}

export async function getOverallInstrumentSentiment(limit = 3, periodDays = 30): Promise<InstrumentSentiment[]> {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.rpc("get_overall_instrument_sentiment", {
      limit_count: limit,
      period_days: periodDays,
    })

    if (error) {
      console.error("Error fetching instrument sentiment via RPC:", error.message)
      if (
        error.code === "42883" ||
        error.message.includes("does not exist") ||
        error.message.includes("could not find the function")
      ) {
        console.warn(
          "RPC function 'get_overall_instrument_sentiment' not found. Please ensure the database migration script (002-create-social-insights-functions.sql) has been run successfully in your Supabase SQL Editor.",
        )
      }
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Exception in getOverallInstrumentSentiment:", error)
    return []
  }
}

export async function getSetupPopularity(limit = 5, periodDays = 30): Promise<SetupPopularity[]> {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.rpc("get_setup_popularity", {
      limit_count: limit,
      period_days: periodDays,
    })

    if (error) {
      console.error("Error fetching setup popularity via RPC:", error.message)
      if (
        error.code === "42883" ||
        error.message.includes("does not exist") ||
        error.message.includes("could not find the function")
      ) {
        console.warn(
          "RPC function 'get_setup_popularity' not found. Please ensure the database migration script (002-create-social-insights-functions.sql) has been run successfully in your Supabase SQL Editor.",
        )
      }
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Exception in getSetupPopularity:", error)
    return []
  }
}
