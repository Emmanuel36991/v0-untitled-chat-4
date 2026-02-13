"use server"

import { createClient } from "@/lib/supabase/server"
import type { CommunityPost, CommunityStats, TrendingTopic, TopPerformer } from "@/types/community"

export async function updateCommunityStats(): Promise<CommunityStats | null> {
  const supabase = await createClient()
  const fixedStatsId = "550e8400-e29b-41d4-a716-446655440099"

  try {
    const { data: calculatedStats, error: rpcError } = await supabase.rpc("calculate_community_stats")

    if (rpcError) {
      console.error("Error calling calculate_community_stats RPC:", rpcError)
      const { data: existingData, error: existingError } = await supabase
        .from("community_stats")
        .select("*")
        .eq("id", fixedStatsId)
        .maybeSingle() // Changed from .single()
      if (existingError) console.error("Error fetching existing community stats after RPC fail:", existingError)
      return existingData || null
    }

    let upsertedData: CommunityStats | null = null
    if (calculatedStats && calculatedStats.length > 0) {
      const stats = calculatedStats[0]
      const { data, error: upsertError } = await supabase
        .from("community_stats")
        .upsert({
          id: fixedStatsId,
          active_traders: stats.active_traders,
          online_now: stats.online_now,
          total_posts: stats.total_posts,
          total_users: stats.total_users,
          weekly_growth: stats.weekly_growth,
          daily_posts: stats.daily_posts,
          neural_networks_active: Math.floor(800 + Math.random() * 200),
          quantum_algorithms: Math.floor(20 + Math.random() * 10),
          prediction_accuracy: Number.parseFloat((92 + Math.random() * 5).toFixed(2)),
          market_signals: Math.floor(1200 + Math.random() * 300),
          avg_engagement_rate: stats.avg_engagement_rate,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single() // Upsert + select + single should return the upserted row or error if ID issue

      if (upsertError) {
        console.error("Error upserting community stats:", upsertError)
        // Fallback: return calculated stats if upsert fails but calculation was fine
        // This might be stale if other fields were meant to be updated by DB triggers not reflected in RPC
        return {
          ...stats,
          id: fixedStatsId,
          // Fill in potentially missing fields if `stats` from RPC is partial
          neural_networks_active: Math.floor(800 + Math.random() * 200),
          quantum_algorithms: Math.floor(20 + Math.random() * 10),
          prediction_accuracy: Number.parseFloat((92 + Math.random() * 5).toFixed(2)),
          market_signals: Math.floor(1200 + Math.random() * 300),
          updated_at: new Date().toISOString(),
        } as CommunityStats
      }
      upsertedData = data
    }

    // If upsert happened, return its result. Otherwise, fetch.
    if (upsertedData) {
      return upsertedData
    }

    // If no calculation or upsert, fetch current stats
    const { data: finalData, error: finalError } = await supabase
      .from("community_stats")
      .select("*")
      .eq("id", fixedStatsId)
      .maybeSingle() // Changed from .single()

    if (finalError) {
      console.error("Error fetching final community stats:", finalError)
      return null
    }
    return finalData
  } catch (error) {
    console.error("Exception in updateCommunityStats:", error)
    return null
  }
}

export async function getCommunityStats(): Promise<CommunityStats | null> {
  const supabase = await createClient()
  const fixedStatsId = "550e8400-e29b-41d4-a716-446655440099"
  try {
    const { data, error } = await supabase.from("community_stats").select("*").eq("id", fixedStatsId).maybeSingle() // Changed from .single()

    if (error) {
      // .maybeSingle() errors if multiple rows are found.
      // If no rows, data is null and error is null.
      console.error("Error fetching community stats in getCommunityStats (potentially multiple rows):", error.message)
      return null
    }
    return data // data will be null if no row found, or the single row object
  } catch (error) {
    // This catch block might be redundant if .maybeSingle() handles its errors gracefully
    // or if the error object from Supabase is the primary concern.
    console.error("Exception in getCommunityStats:", error)
    return null
  }
}

export async function getCommunityPosts(limit = 20, offset = 0): Promise<CommunityPost[]> {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from("community_posts")
      .select(`
        *,
        user:community_users(id, username, avatar_url, tier, verified, win_rate, profit_loss, total_trades)
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching community posts:", error)
      return []
    }
    const postsWithLikes = (data || []).map((post) => ({
      ...post,
      user_has_liked: Math.random() > 0.7, // Simulate likes for now
    }))
    return postsWithLikes
  } catch (error) {
    console.error("Exception in getCommunityPosts:", error)
    return []
  }
}

export async function getTopPerformers(limit = 10): Promise<TopPerformer[]> {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase.rpc("get_top_performers", { limit_count: limit })
    if (error) {
      console.error("Error fetching top performers:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("Exception in getTopPerformers:", error)
    return []
  }
}

export async function getTrendingTopics(limit = 10): Promise<TrendingTopic[]> {
  const supabase = await createClient()
  try {
    await supabase.rpc("update_trending_topics_procedure") // Ensure this procedure exists and works
    const { data, error } = await supabase.rpc("get_trending_topics", { limit_count: limit })
    if (error) {
      console.error("Error fetching trending topics:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("Exception in getTrendingTopics:", error)
    return []
  }
}

export async function createPost(
  content: string,
  tags: string[],
): Promise<{ success: boolean; error?: string; postId?: string }> {
  const supabase = await createClient()
  try {
    const mockUserId = "550e8400-e29b-41d4-a716-446655440000" // Replace with actual auth user ID
    const { data, error } = await supabase
      .from("community_posts")
      .insert({ user_id: mockUserId, content, tags })
      .select()
      .single()
    if (error) {
      console.error("Error creating post:", error)
      return { success: false, error: error.message }
    }
    await supabase.from("community_activity").insert({
      user_id: mockUserId,
      activity_type: "post",
      target_id: data.id,
      metadata: { content_length: content.length },
    })
    return { success: true, postId: data.id }
  } catch (error) {
    console.error("Exception in createPost:", error)
    return { success: false, error: "Failed to create post" }
  }
}

export async function likePost(postId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  try {
    const mockUserId = "550e8400-e29b-41d4-a716-446655440001" // Replace with actual auth user ID
    const { error } = await supabase.from("post_likes").insert({ post_id: postId, user_id: mockUserId })
    if (error) {
      console.error("Error liking post:", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error("Exception in likePost:", error)
    return { success: false, error: "Failed to like post" }
  }
}

export async function unlikePost(postId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  try {
    const mockUserId = "550e8400-e29b-41d4-a716-446655440001" // Replace with actual auth user ID
    const { error } = await supabase.from("post_likes").delete().match({ post_id: postId, user_id: mockUserId })
    if (error) {
      console.error("Error unliking post:", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error("Exception in unlikePost:", error)
    return { success: false, error: "Failed to unlike post" }
  }
}

export async function followUser(userIdToFollow: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  try {
    const mockUserId = "550e8400-e29b-41d4-a716-446655440001" // Replace with actual auth user ID
    const { error } = await supabase
      .from("user_follows")
      .insert({ follower_id: mockUserId, following_id: userIdToFollow })
    if (error) {
      console.error("Error following user:", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error("Exception in followUser:", error)
    return { success: false, error: "Failed to follow user" }
  }
}

export async function addComment(postId: string, content: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  try {
    const mockUserId = "550e8400-e29b-41d4-a716-446655440000"
    const { error } = await supabase.from("post_comments").insert({
      post_id: postId,
      user_id: mockUserId,
      content,
    })
    if (error) {
      console.error("Error adding comment:", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error("Exception in addComment:", error)
    return { success: false, error: "Failed to add comment" }
  }
}

export async function getRecentActivity(limit = 50): Promise<any[]> {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from("community_activity")
      .select(`
        *,
        user:community_users(username, avatar_url, tier)
      `)
      .order("created_at", { ascending: false })
      .limit(limit)
    if (error) {
      console.error("Error fetching recent activity:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("Exception in getRecentActivity:", error)
    return []
  }
}

export async function updateUserActivity(userId: string): Promise<{ success: boolean }> {
  const supabase = await createClient()
  try {
    await supabase.from("community_users").update({ last_active: new Date().toISOString() }).eq("id", userId)
    return { success: true }
  } catch (error) {
    console.error("Exception in updateUserActivity:", error)
    return { success: false }
  }
}

export async function getOnlineUsers(): Promise<number> {
  const supabase = await createClient()
  try {
    const { count, error } = await supabase
      .from("community_users")
      .select("id", { count: "exact", head: true })
      .gte("last_active", new Date(Date.now() - 15 * 60 * 1000).toISOString())
    if (error) {
      console.error("Error fetching online users:", error)
      return 0
    }
    return count || 0
  } catch (error) {
    console.error("Exception in getOnlineUsers:", error)
    return 0
  }
}
