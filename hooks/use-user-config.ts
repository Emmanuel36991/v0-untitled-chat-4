"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type {
  UserConfiguration,
  UserProfile,
  TradingPreferences,
  NotificationPreferences,
  PrivacyPreferences,
} from "@/types/user-config"
import { USER_CONFIG_STORAGE_KEY, DEFAULT_USER_CONFIGURATION, LATEST_CONFIG_VERSION } from "@/types/user-config"
import { fetchUserConfiguration, saveUserConfiguration } from "@/app/actions/user-config-actions"
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client"

export function useUserConfig() {
  const [config, setConfig] = useState<UserConfiguration>(DEFAULT_USER_CONFIGURATION)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const isSavingRef = useRef(false)
  const hasFetchedFromDBRef = useRef(false)

  const syncToDB = useCallback(async (configToSave: UserConfiguration): Promise<boolean> => {
    if (isSavingRef.current) {
      return false
    }
    isSavingRef.current = true
    setIsSyncing(true)
    try {
      const supabase = createSupabaseBrowserClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        const result = await saveUserConfiguration(configToSave)
        if (!result.success) {
          console.error("useUserConfig: Failed to save configuration to DB:", result.error)
          return false
        }
        return true
      }
      return false
    } catch (error) {
      console.error("useUserConfig: Error during DB sync:", error)
      return false
    } finally {
      setIsSyncing(false)
      isSavingRef.current = false
    }
  }, [])

  useEffect(() => {
    if (isLoaded) return

    const loadUserConfig = async () => {
      if (hasFetchedFromDBRef.current) {
        setIsLoaded(true)
        return
      }
      hasFetchedFromDBRef.current = true

      const supabase = createSupabaseBrowserClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      console.log("[v0] Loading user config, authenticated:", !!session?.user)

      if (session?.user) {
        setIsSyncing(true)
        const dbConfig = await fetchUserConfiguration()
        setIsSyncing(false)

        if (dbConfig && dbConfig.profileSetupComplete !== undefined) {
          console.log("[v0] Found database config for user, using it")
          setConfig(dbConfig)
          try {
            localStorage.setItem(USER_CONFIG_STORAGE_KEY, JSON.stringify(dbConfig))
          } catch (error) {
            console.error("Failed to cache config to localStorage:", error)
          }
        } else {
          console.log("[v0] No database config found, starting fresh for new user")
          const freshConfig = { ...DEFAULT_USER_CONFIGURATION }
          setConfig(freshConfig)
          try {
            localStorage.removeItem(USER_CONFIG_STORAGE_KEY)
          } catch (error) {
            console.error("Failed to clear localStorage:", error)
          }
        }
      } else {
        console.log("[v0] No authentication, using default config")
        setConfig(DEFAULT_USER_CONFIGURATION)
      }

      setIsLoaded(true)
    }

    loadUserConfig()
  }, [isLoaded])

  const updateAndSyncConfig = useCallback(
    (newConfigState: UserConfiguration) => {
      setConfig(newConfigState)
      try {
        localStorage.setItem(USER_CONFIG_STORAGE_KEY, JSON.stringify(newConfigState))
      } catch (error) {
        console.error("useUserConfig: Failed to save to localStorage during update:", error)
      }
      syncToDB(newConfigState)
    },
    [syncToDB],
  )

  const updateConfig = useCallback(
    (newConfigPartial: Partial<UserConfiguration>) => {
      setConfig((prevConfig) => {
        const updated = { ...prevConfig, ...newConfigPartial, version: LATEST_CONFIG_VERSION }
        updateAndSyncConfig(updated)
        return updated
      })
    },
    [updateAndSyncConfig],
  )

  const updateUserProfile = useCallback(
    (newProfilePartial: Partial<UserProfile>) => {
      setConfig((prevConfig) => {
        const updatedProfile = { ...prevConfig.userProfile, ...newProfilePartial }
        const updated = { ...prevConfig, userProfile: updatedProfile, version: LATEST_CONFIG_VERSION }
        updateAndSyncConfig(updated)
        return updated
      })
    },
    [updateAndSyncConfig],
  )

  const updateTradingPreferences = useCallback(
    (newPreferencesPartial: Partial<TradingPreferences>) => {
      setConfig((prevConfig) => {
        const updatedPreferences = { ...prevConfig.tradingPreferences, ...newPreferencesPartial }
        const updated = { ...prevConfig, tradingPreferences: updatedPreferences, version: LATEST_CONFIG_VERSION }
        updateAndSyncConfig(updated)
        return updated
      })
    },
    [updateAndSyncConfig],
  )

  const updateNotificationPreferences = useCallback(
    (newPreferencesPartial: Partial<NotificationPreferences>) => {
      setConfig((prevConfig) => {
        const updatedPreferences = { ...prevConfig.notificationPreferences, ...newPreferencesPartial }
        const updated = { ...prevConfig, notificationPreferences: updatedPreferences, version: LATEST_CONFIG_VERSION }
        updateAndSyncConfig(updated)
        return updated
      })
    },
    [updateAndSyncConfig],
  )

  const updatePrivacyPreferences = useCallback(
    (newPreferencesPartial: Partial<PrivacyPreferences>) => {
      setConfig((prevConfig) => {
        const updatedPreferences = { ...prevConfig.privacyPreferences, ...newPreferencesPartial }
        const updated = { ...prevConfig, privacyPreferences: updatedPreferences, version: LATEST_CONFIG_VERSION }
        updateAndSyncConfig(updated)
        return updated
      })
    },
    [updateAndSyncConfig],
  )

  const markSetupComplete = useCallback(async (): Promise<boolean> => {
    const updated = { ...config, profileSetupComplete: true, version: LATEST_CONFIG_VERSION }
    setConfig(updated)
    try {
      localStorage.setItem(USER_CONFIG_STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error("useUserConfig: Failed to save to localStorage during markSetupComplete:", error)
    }
    return await syncToDB(updated)
  }, [config, syncToDB])

  return {
    config,
    updateConfig,
    updateUserProfile,
    updateTradingPreferences,
    updateNotificationPreferences,
    updatePrivacyPreferences,
    markSetupComplete,
    isLoaded,
    isSyncing,
  }
}
