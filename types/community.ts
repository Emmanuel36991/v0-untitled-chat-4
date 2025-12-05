export interface CommunityUser {
  id: string
  username: string
  email: string
  avatar_url?: string
  bio?: string
  tier: "pro" | "elite" | "quantum"
  verified: boolean
  followers_count: number
  following_count: number
  total_trades: number
  win_rate: number
  profit_loss: number
  current_streak: number
  max_streak: number
  created_at: string
  updated_at: string
}

export interface CommunityPost {
  id: string
  user_id: string
  content: string
  tags: string[]
  likes_count: number
  comments_count: number
  shares_count: number
  created_at: string
  updated_at: string
  user?: CommunityUser
  user_has_liked?: boolean
}

export interface PostComment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  user?: CommunityUser
}

export interface TrendingTopic {
  tag: string
  posts_count: number
  growth_rate: number
}

export interface CommunityStats {
  id: string
  active_traders: number
  online_now: number
  total_posts: number
  weekly_growth: number
  neural_networks_active: number
  quantum_algorithms: number
  prediction_accuracy: number
  market_signals: number
  updated_at: string
}

export interface TopPerformer {
  id: string
  username: string
  avatar_url?: string
  tier: string
  verified: boolean
  followers_count: number
  win_rate: number
  current_streak: number
  profit_loss: number
}
