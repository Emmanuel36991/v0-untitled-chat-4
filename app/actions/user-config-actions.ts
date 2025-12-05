"use server"

import { createClient as createSupabaseServerClient } from "@/lib/supabase/server"
import type { UserConfiguration } from "@/types/user-config"
import { DEFAULT_USER_CONFIGURATION, LATEST_CONFIG_VERSION } from "@/types/user-config"

export async function fetchUserConfiguration(): Promise<UserConfiguration | null> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log("[v0] fetchUserConfiguration: No user found, returning null.")
    return null
  }

  try {
    const { data, error } = await supabase
      .from("user_config_settings")
      .select("config, updated_at")
      .eq("user_id", user.id)
      .maybeSingle()

    if (error) {
      console.error("Error fetching user configuration from Supabase:", error.message)
      return null
    }

    if (!data || !data.config) {
      console.log(`[v0] fetchUserConfiguration: No config found for user ${user.id}, returning null (fresh user).`)
      return null
    }

    console.log(`[v0] fetchUserConfiguration: Config found for user ${user.id}. DB updated_at: ${data.updated_at}`)
    // Ensure the fetched config has all default keys, especially for nested objects
    const dbConfig = data.config as Partial<UserConfiguration>
    const mergedConfig: UserConfiguration = {
      ...DEFAULT_USER_CONFIGURATION,
      ...dbConfig,
      userProfile: {
        ...DEFAULT_USER_CONFIGURATION.userProfile,
        ...(dbConfig.userProfile || {}),
      },
      tradingPreferences: {
        ...DEFAULT_USER_CONFIGURATION.tradingPreferences,
        ...(dbConfig.tradingPreferences || {}),
      },
      notificationPreferences: {
        ...DEFAULT_USER_CONFIGURATION.notificationPreferences,
        ...(dbConfig.notificationPreferences || {}),
      },
      privacyPreferences: {
        ...DEFAULT_USER_CONFIGURATION.privacyPreferences,
        ...(dbConfig.privacyPreferences || {}),
      },
      version: dbConfig.version || LATEST_CONFIG_VERSION,
      profileSetupComplete: typeof dbConfig.profileSetupComplete === "boolean" ? dbConfig.profileSetupComplete : false,
    }
    return mergedConfig
  } catch (e) {
    console.error("Unexpected error in fetchUserConfiguration:", e)
    return null
  }
}

export async function saveUserConfiguration(
  configToSave: UserConfiguration,
): Promise<{ success: boolean; error?: string; data?: UserConfiguration }> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log("[v0] saveUserConfiguration: No user found.")
    return { success: false, error: "User not authenticated." }
  }

  // Ensure the config has the latest version before saving
  const payload: UserConfiguration = {
    ...configToSave,
    version: LATEST_CONFIG_VERSION,
  }

  try {
    console.log(`[v0] saveUserConfiguration: Attempting to upsert for user ${user.id}`)
    const { data, error } = await supabase
      .from("user_config_settings")
      .upsert({ user_id: user.id, config: payload }, { onConflict: "user_id" })
      .select("config, updated_at")
      .single()

    if (error) {
      console.error("Error saving user configuration to Supabase:", error.message)
      return { success: false, error: error.message }
    }

    if (data && data.config) {
      console.log(
        `[v0] saveUserConfiguration: Successfully saved for user ${user.id}. DB updated_at: ${data.updated_at}`,
      )
      return { success: true, data: data.config as UserConfiguration }
    }
    console.log(`[v0] saveUserConfiguration: Upsert successful but no data returned for user ${user.id}.`)
    return { success: true, data: payload }
  } catch (e: any) {
    console.error("Unexpected error in saveUserConfiguration:", e.message)
    return { success: false, error: e.message || "An unexpected error occurred." }
  }
}
