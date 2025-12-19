"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { UserConfiguration } from "@/types/user-config"
import { DEFAULT_USER_CONFIGURATION, LATEST_CONFIG_VERSION } from "@/types/user-config"

// --- 1. DEFINE THE DEFAULT STRATEGIES (THE "BLUEPRINTS") ---
const STRATEGY_BLUEPRINTS: Record<string, any> = {
  "ict": {
    name: "ICT Silver Bullet",
    description: "Time-based liquidity run setup targeting specific hour windows (10-11 AM / 3-4 PM).",
    tags: ["ICT", "Scalping", "Time-Based"],
    rules: [
      { id: "1", text: "Time is within Silver Bullet window (10-11 AM or 3-4 PM)", phase: "setup", required: true },
      { id: "2", text: "Liquidity Sweep (Buy/Sell Side) occurs", phase: "setup", required: true },
      { id: "3", text: "Market Structure Shift (MSS) with displacement", phase: "confirmation", required: true },
      { id: "4", text: "Return to Fair Value Gap (FVG)", phase: "execution", required: true }
    ]
  },
  "smc": {
    name: "SMC Order Block Reversal",
    description: "Institutional entry model based on order blocks and structure breaks.",
    tags: ["SMC", "Reversal", "Trend"],
    rules: [
      { id: "1", text: "HTF Key Level reached", phase: "setup", required: true },
      { id: "2", text: "Change of Character (ChoCh) on LTF", phase: "confirmation", required: true },
      { id: "3", text: "Valid Order Block created before the move", phase: "execution", required: true }
    ]
  },
  "wyckoff": {
    name: "Wyckoff Spring Setup",
    description: "Catching the terminal shakeout (Spring) in an accumulation schematic.",
    tags: ["Wyckoff", "Accumulation", "Swing"],
    rules: [
      { id: "1", text: "Trading Range defined (SC, AR, ST)", phase: "setup", required: true },
      { id: "2", text: "Price breaks support but reclaims immediately (Spring)", phase: "confirmation", required: true },
      { id: "3", text: "Test of the Spring holds with lower volume", phase: "execution", required: true }
    ]
  },
  "volume": {
    name: "Volume Profile POC Bounce",
    description: "Trading reactions from high volume nodes and Point of Control.",
    tags: ["Volume", "Profile", "Intraday"],
    rules: [
      { id: "1", text: "Price approaches High Volume Node (HVN) or POC", phase: "setup", required: true },
      { id: "2", text: "Absorption evident in Order Flow/Delta", phase: "confirmation", required: true },
      { id: "3", text: "Rotation candle away from level", phase: "execution", required: true }
    ]
  },
  "sr": {
    name: "S/R Flip Retest",
    description: "Classic support turning into resistance (or vice versa).",
    tags: ["Price Action", "Classic"],
    rules: [
      { id: "1", text: "Clean break of established level", phase: "setup", required: true },
      { id: "2", text: "Correction back to the broken level", phase: "confirmation", required: true },
      { id: "3", text: "Rejection wick at the level", phase: "execution", required: true }
    ]
  }
}

// --- 2. FETCH CONFIGURATION ---
export async function fetchUserConfiguration(): Promise<UserConfiguration | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  try {
    const { data, error } = await supabase
      .from("user_config_settings")
      .select("config")
      .eq("user_id", user.id)
      .maybeSingle()

    if (error || !data) return null

    // Merge defaults
    const dbConfig = data.config as Partial<UserConfiguration>
    return {
      ...DEFAULT_USER_CONFIGURATION,
      ...dbConfig,
      userProfile: { ...DEFAULT_USER_CONFIGURATION.userProfile, ...(dbConfig.userProfile || {}) },
      tradingPreferences: { ...DEFAULT_USER_CONFIGURATION.tradingPreferences, ...(dbConfig.tradingPreferences || {}) },
      profileSetupComplete: dbConfig.profileSetupComplete ?? false,
    }
  } catch (e) {
    console.error("Error fetching config:", e)
    return null
  }
}

// --- 3. SAVE CONFIGURATION & SEED STRATEGIES ---
export async function saveUserConfiguration(
  configToSave: UserConfiguration,
): Promise<{ success: boolean; error?: string; data?: UserConfiguration }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Unauthorized" }

  const payload: UserConfiguration = {
    ...configToSave,
    version: LATEST_CONFIG_VERSION,
  }

  try {
    // A. Save the Config
    const { data, error } = await supabase
      .from("user_config_settings")
      .upsert({ user_id: user.id, config: payload }, { onConflict: "user_id" })
      .select("config")
      .single()

    if (error) throw error

    // B. SEED STRATEGIES if Profile is Complete
    // We check if methodologies are selected and then create the strategies in the DB
    if (configToSave.profileSetupComplete && configToSave.tradingPreferences?.methodologies) {
      await seedStrategies(supabase, user.id, configToSave.tradingPreferences.methodologies)
    }

    revalidatePath("/playbook")
    
    return { success: true, data: data?.config as UserConfiguration }
  } catch (e: any) {
    console.error("Error saving config:", e.message)
    return { success: false, error: e.message }
  }
}

// Internal Helper to Insert Strategies
async function seedStrategies(supabase: any, userId: string, methodIds: string[]) {
  // 1. Check if user already has strategies (avoid duplicates)
  const { count } = await supabase
    .from("playbook_strategies")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", userId)

  if (count && count > 0) return // Already seeded

  // 2. Map Methodologies to Strategy Objects
  const strategiesToInsert = methodIds
    .map(id => STRATEGY_BLUEPRINTS[id.toLowerCase()]) // e.g. "ict" -> Silver Bullet object
    .filter(Boolean)
    .map(blueprint => ({
      user_id: userId,
      name: blueprint.name,
      description: blueprint.description,
      tags: blueprint.tags,
      rules: blueprint.rules, // Stored as JSONB
      // Initialize Stats
      win_rate: 0,
      profit_factor: 0,
      trades_count: 0,
      pnl: 0,
      equity_curve: [0], 
    }))

  if (strategiesToInsert.length > 0) {
    await supabase.from("playbook_strategies").insert(strategiesToInsert)
  }
}
