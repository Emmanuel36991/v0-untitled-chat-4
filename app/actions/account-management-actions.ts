'use server'

import { createClient } from '@/lib/supabase/server'
import { fetchUserConfiguration, saveUserConfiguration } from './user-config-actions'

/**
 * Export all user data as a JSON object (GDPR Right to Data Portability).
 * Returns a serializable object that the client can trigger as a download.
 */
export async function exportUserData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const userId = user.id

  // Fetch all user tables in parallel
  const [
    tradesResult,
    configResult,
    psychologyResult,
    strategiesResult,
    accountsResult,
    subscriptionResult,
  ] = await Promise.all([
    supabase.from('trades').select('*').eq('user_id', userId),
    supabase.from('user_config_settings').select('*').eq('user_id', userId).single(),
    supabase.from('psychology_journal').select('*').eq('user_id', userId),
    supabase.from('playbook_strategies').select('*').eq('user_id', userId),
    supabase.from('trading_accounts').select('*').eq('user_id', userId),
    supabase.from('subscriptions').select('*').eq('user_id', userId).single(),
  ])

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email,
      createdAt: user.created_at,
    },
    configuration: configResult.data?.config || null,
    trades: tradesResult.data || [],
    psychologyJournal: psychologyResult.data || [],
    playbookStrategies: strategiesResult.data || [],
    tradingAccounts: accountsResult.data || [],
    subscription: subscriptionResult.data || null,
  }

  return { success: true, data: exportPayload }
}

/**
 * Request account deletion with a 30-day grace period (GDPR Right to be Forgotten).
 * Sets a flag in the user config. Actual deletion would be handled by a scheduled job.
 */
export async function requestAccountDeletion() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const config = await fetchUserConfiguration()
  if (!config) {
    return { success: false, error: 'Could not load user configuration' }
  }

  const updatedConfig = {
    ...config,
    privacyPreferences: {
      ...config.privacyPreferences,
      deletionRequestedAt: new Date().toISOString(),
    },
  }

  const result = await saveUserConfiguration(updatedConfig)
  if (!result.success) {
    return { success: false, error: 'Failed to save deletion request' }
  }

  return { success: true, deletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
}

/**
 * Cancel a pending account deletion request during the 30-day grace period.
 */
export async function cancelAccountDeletion() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const config = await fetchUserConfiguration()
  if (!config) {
    return { success: false, error: 'Could not load user configuration' }
  }

  const updatedConfig = {
    ...config,
    privacyPreferences: {
      ...config.privacyPreferences,
      deletionRequestedAt: null,
    },
  }

  const result = await saveUserConfiguration(updatedConfig)
  if (!result.success) {
    return { success: false, error: 'Failed to cancel deletion request' }
  }

  return { success: true }
}
