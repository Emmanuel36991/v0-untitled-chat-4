"use server"

import { createClient as createSupabaseServerClient } from "@/lib/supabase/server"
import type { UserConfiguration } from "@/types/user-config"
import { DEFAULT_USER_CONFIGURATION, LATEST_CONFIG_VERSION } from "@/types/user-config"
import { STRATEGY_BLUEPRINTS } from "@/lib/strategy-templates"
import { revalidatePath } from "next/cache"

export async function fetchUserConfiguration(): Promise<UserConfiguration | null> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  try {
    const { data, error } = await supabase
      .from("user_config_settings")
      .select("config")
      .eq("user_id", user.id)
      .maybeSingle()

    if (error && error.code !== "PGRST116") return null
    if (!data || !data.config) return null

    // Merge defaults
    const dbConfig = data.config as Partial<UserConfiguration>
    return {
      ...DEFAULT_USER_CONFIGURATION,
      ...dbConfig,
      userProfile: { ...DEFAULT_USER_CONFIGURATION.userProfile, ...(dbConfig.userProfile || {}) },
      tradingPreferences: { ...DEFAULT_USER_CONFIGURATION.tradingPreferences, ...(dbConfig.tradingPreferences || {}) },
      version: dbConfig.version || LATEST_CONFIG_VERSION,
      profileSetupComplete: typeof dbConfig.profileSetupComplete === "boolean" ? dbConfig.profileSetupComplete : false,
    }
  } catch (e) {
    return null
  }
}

export async function saveUserConfiguration(
  configToSave: UserConfiguration,
): Promise<{ success: boolean; error?: string; data?: UserConfiguration }> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Unauthorized" }

  const payload: UserConfiguration = {
    ...configToSave,
    version: LATEST_CONFIG_VERSION,
  }

  try {
    // 1. Save Config
    const { data, error } = await supabase
      .from("user_config_settings")
      .upsert({ user_id: user.id, config: payload }, { onConflict: "user_id" })
      .select("config")
      .single()

    if (error) throw error

    // 2. Intelligent Seeding
    // If setup is complete, ensure strategies exist in the DB
    if (configToSave.profileSetupComplete && configToSave.tradingPreferences?.methodologies) {
      await seedStrategiesFromBlueprints(supabase, user.id, configToSave.tradingPreferences.methodologies)
    }

    revalidatePath("/playbook")
    revalidatePath("/dashboard")

    return { success: true, data: data?.config as UserConfiguration }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

async function seedStrategiesFromBlueprints(supabase: any, userId: string, methodIds: string[]) {
  // Check if playbook is empty to avoid dupes/overwrites
  const { count } = await supabase
    .from("playbook_strategies")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", userId)

  if (count && count > 0) return 

  let strategiesToInsert: any[] = []

  methodIds.forEach(methodId => {
    // Map "ict", "smc" etc to their blueprints
    const key = methodId.toLowerCase()
    const blueprints = STRATEGY_BLUEPRINTS[key]
    
    if (blueprints && blueprints.length > 0) {
      const mapped = blueprints.map(bp => ({
        user_id: userId,
        name: bp.name,
        description: bp.description,
        tags: bp.tags,
        rules: bp.rules, // Stored as JSONB
        // Init Stats
        win_rate: 0,
        profit_factor: 0,
        trades_count: 0,
        pnl: 0,
        equity_curve: [0]
      }))
      strategiesToInsert = [...strategiesToInsert, ...mapped]
    }
  })

  if (strategiesToInsert.length > 0) {
    await supabase.from("playbook_strategies").insert(strategiesToInsert)
  }
}
