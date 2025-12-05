"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  TrendingUp,
  Users,
  MessageSquare,
  Heart,
  Share2,
  Filter,
  Search,
  Zap,
  Target,
  Brain,
  Rocket,
  Globe,
  Activity,
  Star,
  Trophy,
  Flame,
  ChevronRight,
  BarChart3,
  Plus,
  RefreshCw,
  Send,
  Loader2,
  ServerCrash,
} from "lucide-react"
import {
  updateCommunityStats,
  getCommunityPosts,
  getTopPerformers,
  getTrendingTopics,
  createPost,
  likePost,
  unlikePost,
  followUser,
} from "@/app/actions/community-actions"
import {
  getInstrumentPopularity,
  getOverallInstrumentSentiment,
  getSetupPopularity,
} from "@/app/actions/social-insights-actions"
import type { CommunityPost, CommunityStats, TrendingTopic, TopPerformer } from "@/types/community"
import type { InstrumentPopularity, InstrumentSentiment, SetupPopularity } from "@/types/social-insights"

export default function SocialInsightsPage() {
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null)
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([])
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [instrumentPopularity, setInstrumentPopularity] = useState<InstrumentPopularity[]>([])
  const [instrumentSentiment, setInstrumentSentiment] = useState<InstrumentSentiment[]>([])
  const [setupPopularity, setSetupPopularity] = useState<SetupPopularity[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("feed")
  const [refreshing, setRefreshing] = useState(false)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostTags, setNewPostTags] = useState("")
  const [submittingPost, setSubmittingPost] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "error">("connecting")

  const loadData = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }
    setConnectionStatus("connecting")
    setError(null)

    try {
      let statsData: CommunityStats | null = null
      try {
        statsData = await updateCommunityStats()
        // No need to call getCommunityStats again if updateCommunityStats returns null,
        // as updateCommunityStats already tries to fetch if its own update/RPC fails.
      } catch (statsError) {
        console.error("Critical error during updateCommunityStats call:", statsError)
        // statsData will remain null or its last value
      }

      const [postsData, performersData, topicsData, popInstData, sentInstData, popSetupData] = await Promise.all([
        getCommunityPosts(20).catch((e) => {
          console.error("Error fetching community posts:", e)
          return []
        }),
        getTopPerformers(10).catch((e) => {
          console.error("Error fetching top performers:", e)
          return []
        }),
        getTrendingTopics(6).catch((e) => {
          console.error("Error fetching trending topics:", e)
          return []
        }),
        getInstrumentPopularity(5, 30).catch((e) => {
          console.error("Error fetching instrument popularity:", e)
          return []
        }),
        getOverallInstrumentSentiment(3, 30).catch((e) => {
          console.error("Error fetching instrument sentiment:", e)
          return []
        }),
        getSetupPopularity(5, 30).catch((e) => {
          console.error("Error fetching setup popularity:", e)
          return []
        }),
      ])

      setCommunityStats(statsData)
      setPosts(postsData)
      setTopPerformers(performersData)
      setTrendingTopics(topicsData)
      setInstrumentPopularity(popInstData)
      setInstrumentSentiment(sentInstData)
      setSetupPopularity(popSetupData)

      if (!statsData && !isInitialLoad) {
        // Only set error if not initial and stats are still null
        setError((prevError) =>
          prevError ? `${prevError} Community stats could not be loaded.` : "Community stats could not be loaded.",
        )
      }
      setConnectionStatus("connected")
    } catch (err) {
      console.error("Major error during data load sequence:", err)
      setError("A critical error occurred while loading community data. Some sections may be unavailable.")
      setConnectionStatus("error")
    } finally {
      if (isInitialLoad) setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData(true)
  }, [loadData])

  useEffect(() => {
    const interval = setInterval(() => {
      if (connectionStatus !== "connecting" && !refreshing) {
        loadData()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [loadData, connectionStatus, refreshing])

  const handleRefresh = () => {
    if (!refreshing && connectionStatus !== "connecting") {
      loadData()
    }
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return
    setSubmittingPost(true)
    try {
      const tags = newPostTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
      const result = await createPost(newPostContent, tags)
      if (result.success) {
        setNewPostContent("")
        setNewPostTags("")
        setShowCreatePost(false)
        await loadData()
      } else {
        setError(result.error || "Failed to create post")
      }
    } catch (err) {
      console.error("Error creating post:", err)
      setError("Failed to create post")
    } finally {
      setSubmittingPost(false)
    }
  }

  const handleLikePost = async (postId: string, currentlyLiked: boolean) => {
    const originalPosts = [...posts]
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === postId
          ? {
              ...p,
              likes_count: currentlyLiked ? p.likes_count - 1 : p.likes_count + 1,
              user_has_liked: !currentlyLiked,
            }
          : p,
      ),
    )
    try {
      if (currentlyLiked) await unlikePost(postId)
      else await likePost(postId)
    } catch (err) {
      console.error("Error toggling like:", err)
      setPosts(originalPosts)
      setError("Failed to update like status. Please try again.")
    }
  }

  const handleFollowUser = async (userId: string) => {
    try {
      await followUser(userId)
      await loadData()
    } catch (err) {
      console.error("Error following user:", err)
      setError("Failed to follow user. Please try again.")
    }
  }

  const filteredPosts = posts.filter((post) => {
    const postUser = post.user
    const matchesSearch =
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (postUser && postUser.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "verified" && postUser?.verified) ||
      (selectedFilter === "high-performance" && postUser && postUser.win_rate > 90)
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto" />
          <div className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Initializing Neural Network...
          </div>
          <div className="text-sm text-slate-400">Connecting to quantum trading hub</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10 p-6 space-y-8">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 backdrop-blur-sm">
            <Globe className="w-6 h-6 text-cyan-400 animate-pulse" />
            <span className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Quantum Trading Hub
            </span>
            <Rocket className="w-6 h-6 text-purple-400 animate-bounce" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Neural Community Network
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Connect with elite traders in our quantum-enhanced ecosystem. Share strategies, analyze market patterns, and
            evolve your trading consciousness.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handleRefresh}
              disabled={refreshing || connectionStatus === "connecting"}
              variant="outline"
              size="sm"
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${refreshing || connectionStatus === "connecting" ? "animate-spin" : ""}`}
              />
              {refreshing || connectionStatus === "connecting" ? "Syncing..." : "Sync Data"}
            </Button>
            <Button
              onClick={() => setShowCreatePost(true)}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Share Insight
            </Button>
          </div>
        </div>

        {error && (
          <Card className="bg-red-900/30 border-red-500/50 text-red-300 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ServerCrash className="w-5 h-5" /> Data Load Issue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
              <p className="text-sm mt-2">Some information may be outdated or unavailable. Please try refreshing.</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Neural Networks Active",
              valueKey: "neural_networks_active",
              icon: Brain,
              gradient: "from-purple-500 to-pink-500",
            },
            {
              title: "Quantum Algorithms",
              valueKey: "quantum_algorithms",
              icon: Zap,
              gradient: "from-cyan-500 to-blue-500",
            },
            {
              title: "Prediction Accuracy",
              valueKey: "prediction_accuracy",
              unit: "%",
              icon: Target,
              gradient: "from-green-500 to-emerald-500",
            },
            {
              title: "Market Signals",
              valueKey: "market_signals",
              icon: Activity,
              gradient: "from-orange-500 to-red-500",
            },
          ].map((stat, idx) => (
            <Card
              key={idx}
              className="relative bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-slate-700/50 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-500 group overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
              />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} bg-opacity-20`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  {communityStats && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
                </div>
                <div className="space-y-2">
                  {communityStats === null && connectionStatus !== "error" && !error ? (
                    <Skeleton className="h-8 w-24" />
                  ) : communityStats && communityStats[stat.valueKey as keyof CommunityStats] !== undefined ? (
                    <div className="text-3xl font-bold text-white">
                      {typeof communityStats[stat.valueKey as keyof CommunityStats] === "number"
                        ? (communityStats[stat.valueKey as keyof CommunityStats] as number).toLocaleString(undefined, {
                            maximumFractionDigits: stat.unit === "%" ? 1 : 0,
                          })
                        : "N/A"}
                      {stat.unit}
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-slate-500">N/A</div>
                  )}
                  <div className="text-sm text-slate-400">{stat.title}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {showCreatePost && (
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/60 border-slate-700/50 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                Share Your Trading Insight
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Share your latest trading insights, strategies, or market analysis..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-cyan-500/50 min-h-[120px]"
              />
              <Input
                placeholder="Tags (comma-separated, e.g., AI_Trading, CryptoAnalysis)"
                value={newPostTags}
                onChange={(e) => setNewPostTags(e.target.value)}
                className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-cyan-500/50"
              />
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleCreatePost}
                  disabled={submittingPost || !newPostContent.trim()}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submittingPost ? "Publishing..." : "Publish Insight"}
                </Button>
                <Button
                  onClick={() => setShowCreatePost(false)}
                  variant="outline"
                  className="border-slate-600/50 text-slate-400 hover:bg-slate-800/50"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
            <TabsTrigger
              value="feed"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-cyan-400"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Neural Feed ({posts.length})
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-cyan-400"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Elite Traders ({topPerformers.length})
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-cyan-400"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Quantum Analytics
            </TabsTrigger>
            <TabsTrigger
              value="trends"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-cyan-400"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Trend Matrix ({trendingTopics.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <Card className="bg-gradient-to-r from-slate-900/50 to-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      placeholder="Search neural patterns, traders, or quantum strategies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-cyan-500/50"
                    />
                  </div>
                  <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                    <SelectTrigger className="w-full md:w-48 bg-slate-800/50 border-slate-600/50 text-white">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all">All Signals</SelectItem>
                      <SelectItem value="verified">Verified Only</SelectItem>
                      <SelectItem value="high-performance">Elite Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-6">
              {connectionStatus === "connecting" && posts.length === 0 && !error && (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  <span className="ml-2 text-slate-300">Loading feed...</span>
                </div>
              )}
              {connectionStatus !== "connecting" && filteredPosts.length === 0 && !error && (
                <Card className="bg-gradient-to-br from-slate-900/70 to-slate-800/40 border-slate-700/50 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">No posts match your criteria</h3>
                    <p className="text-slate-400">
                      Try adjusting your search or filters. If the feed is empty, be the first to share an insight!
                    </p>
                  </CardContent>
                </Card>
              )}
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="bg-gradient-to-br from-slate-900/70 to-slate-800/40 border-slate-700/50 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-500 group"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12 border-2 border-cyan-500/30">
                            <AvatarImage
                              src={
                                post.user?.avatar_url ||
                                `/placeholder.svg?height=40&width=40&query=user+${post.user?.username || "avatar"}`
                              }
                            />
                            <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
                              {post.user?.username?.slice(0, 2).toUpperCase() || "UN"}
                            </AvatarFallback>
                          </Avatar>
                          {post.user?.verified && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                              <Star className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{post.user?.username || "Unknown User"}</span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${post.user?.tier === "quantum" ? "border-purple-500/50 text-purple-400" : post.user?.tier === "elite" ? "border-cyan-500/50 text-cyan-400" : "border-green-500/50 text-green-400"}`}
                            >
                              {post.user?.tier?.toUpperCase() || "PRO"}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-400">{new Date(post.created_at).toLocaleString()}</div>
                        </div>
                      </div>
                      {post.user && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-400">
                            {(post.user.win_rate ?? 0).toFixed(1)}%
                          </div>
                          <div className="text-xs text-slate-400">Win Rate</div>
                        </div>
                      )}
                    </div>
                    <div className="mb-4">
                      <p className="text-slate-200 leading-relaxed mb-3">{post.content}</p>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-400 border-cyan-500/20 hover:border-cyan-500/40 transition-colors cursor-pointer"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {post.user && (
                      <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">
                            {(post.user.profit_loss ?? 0).toFixed(1)}%
                          </div>
                          <div className="text-xs text-slate-400">P&L</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-400">{post.user.total_trades ?? 0}</div>
                          <div className="text-xs text-slate-400">Trades</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-400">
                            {(post.user.win_rate ?? 0).toFixed(1)}%
                          </div>
                          <div className="text-xs text-slate-400">Accuracy</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleLikePost(post.id, post.user_has_liked || false)}
                          className={`flex items-center gap-2 transition-colors group ${post.user_has_liked ? "text-red-400" : "text-slate-400 hover:text-red-400"}`}
                        >
                          <Heart
                            className={`w-5 h-5 group-hover:scale-110 transition-transform ${post.user_has_liked ? "fill-current" : ""}`}
                          />
                          <span>{post.likes_count}</span>
                        </button>
                        <button className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors group">
                          <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span>{post.comments_count}</span>
                        </button>
                        <button className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors group">
                          <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span>{post.shares_count}</span>
                        </button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                      >
                        View Analysis
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-900/70 to-slate-800/40 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  Quantum Elite Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {connectionStatus === "connecting" && topPerformers.length === 0 && !error && (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                    <span className="ml-2 text-slate-300">Loading leaderboard...</span>
                  </div>
                )}
                {connectionStatus !== "connecting" && topPerformers.length === 0 && !error && (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">No elite traders found. Be the first to join the leaderboard!</p>
                  </div>
                )}
                {topPerformers.map((trader, index) => (
                  <div
                    key={trader.id}
                    className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-cyan-500/30 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-black" : index === 1 ? "bg-gradient-to-r from-gray-300 to-gray-400 text-black" : index === 2 ? "bg-gradient-to-r from-orange-400 to-red-400 text-white" : "bg-gradient-to-r from-slate-600 to-slate-700 text-white"}`}
                        >
                          {index + 1}
                        </div>
                      </div>
                      <Avatar className="w-12 h-12 border-2 border-cyan-500/30">
                        <AvatarImage
                          src={
                            trader.avatar_url ||
                            `/placeholder.svg?height=40&width=40&query=leader+${trader.username || "avatar"}`
                          }
                        />
                        <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
                          {trader.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-white">{trader.username}</div>
                        <div className="text-sm text-slate-400">
                          {trader.followers_count.toLocaleString()} followers
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">{trader.win_rate.toFixed(1)}%</div>
                        <div className="text-xs text-slate-400">Performance</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-400" />
                          <span className="text-lg font-bold text-orange-400">{trader.current_streak}</span>
                        </div>
                        <div className="text-xs text-slate-400">Win Streak</div>
                      </div>
                      <Button
                        onClick={() => handleFollowUser(trader.id)}
                        variant="outline"
                        size="sm"
                        className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                      >
                        Follow
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-slate-900/70 to-slate-800/40 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    Community Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!communityStats && connectionStatus === "connecting" && !error && (
                    <>
                      <Skeleton className="h-6 w-3/4 mb-1" /> <Skeleton className="h-2 w-full mb-4" />
                      <Skeleton className="h-6 w-3/4 mb-1" /> <Skeleton className="h-2 w-full mb-4" />
                      <Skeleton className="h-6 w-3/4 mb-1" /> <Skeleton className="h-2 w-full mb-4" />
                      <Skeleton className="h-6 w-3/4 mb-1" /> <Skeleton className="h-2 w-full" />
                    </>
                  )}
                  {communityStats && (
                    <>
                      {[
                        {
                          label: "Active Traders",
                          value: communityStats.active_traders,
                          color: "text-cyan-400",
                          totalKey: "total_users",
                        },
                        {
                          label: "Online Now",
                          value: communityStats.online_now,
                          color: "text-green-400",
                          totalKey: "active_traders",
                        },
                        {
                          label: "Weekly Growth",
                          value: communityStats.weekly_growth,
                          unit: "%",
                          color: "text-purple-400",
                        },
                        {
                          label: "Avg. Engagement",
                          value: communityStats.avg_engagement_rate,
                          unit: "%",
                          color: "text-pink-400",
                        },
                      ].map((metric, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-300">{metric.label}</span>
                            <span className={`text-2xl font-bold ${metric.color}`}>
                              {(metric.value ?? 0).toLocaleString(undefined, {
                                maximumFractionDigits: metric.unit === "%" ? 1 : 0,
                              })}
                              {metric.unit}
                            </span>
                          </div>
                          <Progress
                            value={
                              metric.totalKey && communityStats[metric.totalKey as keyof CommunityStats]
                                ? ((metric.value ?? 0) /
                                    ((communityStats[metric.totalKey as keyof CommunityStats] as number) || 1)) *
                                  100
                                : Math.abs(metric.value ?? 0)
                            }
                            className="h-2 bg-slate-700"
                            indicatorClassName={metric.color.replace("text-", "bg-")}
                          />
                        </div>
                      ))}
                    </>
                  )}
                  {!communityStats &&
                    (connectionStatus === "error" || (connectionStatus !== "connecting" && error)) && (
                      <p className="text-slate-400 text-center py-4">Community metrics are currently unavailable.</p>
                    )}
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-slate-900/70 to-slate-800/40 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    Neural Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Signal Processing", status: "Active", color: "green" },
                    { label: "Pattern Recognition", status: "Learning", color: "cyan" },
                    { label: "Quantum Analysis", status: "Processing", color: "purple" },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 bg-${activity.color}-400 rounded-full animate-pulse`}></div>
                        <span className="text-slate-300">{activity.label}</span>
                      </div>
                      <span className={`text-${activity.color}-400 font-semibold`}>{activity.status}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            {(instrumentPopularity.length > 0 || instrumentSentiment.length > 0 || setupPopularity.length > 0) && (
              <Card className="bg-gradient-to-br from-slate-900/70 to-slate-800/40 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    Live Trading Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {instrumentPopularity.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-cyan-400">Popular Instruments</h4>
                        {instrumentPopularity.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-slate-300">{item.instrument}</span>
                            <span className="text-white">{item.trade_count} trades</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {instrumentSentiment.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-purple-400">Market Sentiment</h4>
                        {instrumentSentiment.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-slate-300">{item.instrument}</span>
                            <span className="text-white">{item.long_percentage}% long</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {setupPopularity.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-green-400">Top Setups</h4>
                        {setupPopularity.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-slate-300">{item.setup_name}</span>
                            <span className="text-white">{item.trade_count} uses</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {instrumentPopularity.length === 0 &&
                    instrumentSentiment.length === 0 &&
                    setupPopularity.length === 0 &&
                    connectionStatus !== "connecting" &&
                    !error && (
                      <p className="text-slate-400 text-center py-4">
                        No live trading data insights available at the moment.
                      </p>
                    )}
                  {connectionStatus === "connecting" &&
                    instrumentPopularity.length === 0 &&
                    instrumentSentiment.length === 0 &&
                    setupPopularity.length === 0 &&
                    !error && (
                      <div className="flex justify-center items-center py-10">
                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                        <span className="ml-2 text-slate-300">Loading trading data...</span>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-900/70 to-slate-800/40 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                  Trending Neural Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                {connectionStatus === "connecting" && trendingTopics.length === 0 && !error && (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                    <span className="ml-2 text-slate-300">Loading trends...</span>
                  </div>
                )}
                {connectionStatus !== "connecting" && trendingTopics.length === 0 && !error && (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">No trending topics found. Start a conversation to create trends!</p>
                  </div>
                )}
                {trendingTopics.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trendingTopics.map((topic, index) => (
                      <div
                        key={index}
                        className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-cyan-500/30 transition-all duration-300 group cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-cyan-400 text-lg">{topic.tag}</span>
                          <Badge variant="outline" className="border-green-500/50 text-green-400">
                            +{topic.growth_rate.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">{topic.posts_count} neural signals</span>
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`flex items-center gap-2 px-4 py-2 bg-slate-900/90 border rounded-full backdrop-blur-sm transition-all duration-300 ${connectionStatus === "connected" ? "border-green-500/50" : connectionStatus === "connecting" ? "border-yellow-500/50" : "border-red-500/50"}`}
          >
            <div
              className={`w-2 h-2 rounded-full ${connectionStatus === "connected" ? "bg-green-400 animate-pulse" : connectionStatus === "connecting" ? "bg-yellow-400 animate-spin" : "bg-red-400 animate-pulse"}`}
            ></div>
            <span className="text-sm text-slate-300">
              {connectionStatus === "connected"
                ? "Live Data"
                : connectionStatus === "connecting"
                  ? "Syncing..."
                  : "Connection Issue"}
            </span>
            {communityStats && connectionStatus === "connected" && (
              <span className="text-xs text-slate-400">
                Updated {new Date(communityStats.updated_at).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-700 ${className}`} />
}
