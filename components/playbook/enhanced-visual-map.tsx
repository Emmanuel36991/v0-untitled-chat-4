"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { 
  Network, 
  Link2, 
  TrendingUp, 
  CheckCircle, 
  Target, 
  Sparkles,
  Plus,
  X,
  GitMerge
} from "lucide-react"
import type { PlaybookStrategy, MergedStrategy, StrategyRelationship } from "@/types"
import { createMergedStrategy, getMergedStrategies, getStrategyRelationships } from "@/app/actions/strategy-merge-actions"
import { cn } from "@/lib/utils"
import { StrategyNetworkGraph } from "./strategy-network-graph"

interface EnhancedVisualMapProps {
  strategies: PlaybookStrategy[]
}

export function EnhancedVisualMap({ strategies }: EnhancedVisualMapProps) {
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([])
  const [mergedStrategies, setMergedStrategies] = useState<MergedStrategy[]>([])
  const [relationships, setRelationships] = useState<StrategyRelationship[]>([])
  const [showMergeDialog, setShowMergeDialog] = useState(false)
  const [mergeName, setMergeName] = useState("")
  const [mergeDescription, setMergeDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadMergedStrategies()
    loadRelationships()
  }, [])

  async function loadMergedStrategies() {
    const { data } = await getMergedStrategies()
    if (data) {
      setMergedStrategies(data)
    }
  }

  async function loadRelationships() {
    const { data } = await getStrategyRelationships()
    if (data) {
      setRelationships(data)
    }
  }

  function toggleStrategySelection(strategyId: string) {
    setSelectedStrategies(prev =>
      prev.includes(strategyId)
        ? prev.filter(id => id !== strategyId)
        : [...prev, strategyId]
    )
  }

  function isStrategyConnected(strategyId: string, otherStrategyId: string) {
    return relationships.some(
      rel =>
        (rel.parent_strategy_id === strategyId && rel.child_strategy_id === otherStrategyId) ||
        (rel.parent_strategy_id === otherStrategyId && rel.child_strategy_id === strategyId)
    )
  }

  function getStrategyRelationshipStrength(strategyId: string, otherStrategyId: string) {
    const rel = relationships.find(
      r =>
        (r.parent_strategy_id === strategyId && r.child_strategy_id === otherStrategyId) ||
        (r.parent_strategy_id === otherStrategyId && r.child_strategy_id === strategyId)
    )
    return rel?.relationship_strength || 0
  }

  async function handleCreateMerge() {
    if (selectedStrategies.length < 2) {
      toast({
        title: "Select Multiple Strategies",
        description: "You need to select at least 2 strategies to merge.",
        variant: "destructive"
      })
      return
    }

    if (!mergeName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for the merged strategy.",
        variant: "destructive"
      })
      return
    }

    setIsCreating(true)

    const { data, error } = await createMergedStrategy(
      mergeName,
      mergeDescription || null,
      selectedStrategies
    )

    setIsCreating(false)

    if (error) {
      toast({
        title: "Error Creating Merge",
        description: error,
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Strategies Merged Successfully",
      description: `Created merged strategy: ${mergeName}`
    })

    setShowMergeDialog(false)
    setMergeName("")
    setMergeDescription("")
    setSelectedStrategies([])
    loadMergedStrategies()
    loadRelationships()
  }

  function getConnectedStrategies(strategyId: string) {
    const connected = new Set<string>()
    relationships.forEach(rel => {
      if (rel.parent_strategy_id === strategyId) {
        connected.add(rel.child_strategy_id)
      } else if (rel.child_strategy_id === strategyId) {
        connected.add(rel.parent_strategy_id)
      }
    })
    return Array.from(connected)
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Network className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Strategy Relationships
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Connect and merge strategies to see unified insights
          </p>
        </div>
        <Button
          onClick={() => setShowMergeDialog(true)}
          disabled={selectedStrategies.length < 2}
          className="gap-2"
        >
          <GitMerge className="w-4 h-4" />
          Merge Selected ({selectedStrategies.length})
        </Button>
      </div>

      {/* Merged Strategies Section */}
      {mergedStrategies.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <Sparkles className="w-5 h-5" />
            Merged Strategy Groups
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mergedStrategies.map(merged => (
              <Card key={merged.id} className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50/50 to-blue-50/50 dark:from-emerald-950/20 dark:to-blue-950/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <GitMerge className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        {merged.name}
                      </CardTitle>
                      {merged.description && (
                        <CardDescription className="mt-1 text-xs">
                          {merged.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Merged Strategies */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">MERGED STRATEGIES</Label>
                    <div className="flex flex-wrap gap-2">
                      {merged.strategies.map(strategy => (
                        <Badge key={strategy.id} variant="secondary" className="gap-1">
                          <Target className="w-3 h-3" />
                          {strategy.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Combined Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/50 dark:bg-zinc-900/50 p-3 rounded-lg border">
                      <div className="text-xs text-muted-foreground">Win Rate</div>
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {(merged.combined_win_rate * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-white/50 dark:bg-zinc-900/50 p-3 rounded-lg border">
                      <div className="text-xs text-muted-foreground">Profit Factor</div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {merged.combined_profit_factor.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-white/50 dark:bg-zinc-900/50 p-3 rounded-lg border">
                      <div className="text-xs text-muted-foreground">Total Trades</div>
                      <div className="text-lg font-bold">{merged.combined_trades_count}</div>
                    </div>
                    <div className="bg-white/50 dark:bg-zinc-900/50 p-3 rounded-lg border">
                      <div className="text-xs text-muted-foreground">Combined P&L</div>
                      <div className={cn(
                        "text-lg font-bold",
                        merged.combined_pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )}>
                        ${merged.combined_pnl.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Common Good Habits */}
                  {merged.common_good_habits && merged.common_good_habits.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        COMMON GOOD HABITS
                      </Label>
                      <div className="flex flex-wrap gap-1.5">
                        {merged.common_good_habits.map((habit, idx) => (
                          <Badge key={idx} className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 text-xs">
                            {habit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Network Visualization */}
      {(strategies.length > 0 && relationships.length > 0) && (
        <div className="mt-6">
          <StrategyNetworkGraph
            strategies={strategies}
            mergedStrategies={mergedStrategies}
            relationships={relationships}
          />
        </div>
      )}

      {/* Individual Strategies with Connection Indicators */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Individual Strategies
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map(strategy => {
            const connectedStrategyIds = getConnectedStrategies(strategy.id)
            const isSelected = selectedStrategies.includes(strategy.id)
            
            return (
              <Card
                key={strategy.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-lg relative overflow-hidden",
                  isSelected && "ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50/30 dark:bg-blue-950/20",
                  connectedStrategyIds.length > 0 && "border-emerald-300 dark:border-emerald-700"
                )}
                onClick={() => toggleStrategySelection(strategy.id)}
              >
                {/* Connection Indicator */}
                {connectedStrategyIds.length > 0 && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-400 dark:border-emerald-600">
                      <Link2 className="w-3 h-3" />
                      {connectedStrategyIds.length}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Checkbox checked={isSelected} className="mt-1" />
                    <div className="flex-1">
                      <CardTitle className="text-base">{strategy.name}</CardTitle>
                      {strategy.description && (
                        <CardDescription className="text-xs mt-1 line-clamp-2">
                          {strategy.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Win Rate</div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">
                        {(strategy.win_rate * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Trades</div>
                      <div className="font-bold">{strategy.trades_count}</div>
                    </div>
                  </div>

                  {/* Connected Strategies */}
                  {connectedStrategyIds.length > 0 && (
                    <div className="pt-2 border-t">
                      <Label className="text-xs text-muted-foreground mb-1 block">Connected to:</Label>
                      <div className="flex flex-wrap gap-1">
                        {connectedStrategyIds.slice(0, 2).map(connectedId => {
                          const connectedStrategy = strategies.find(s => s.id === connectedId)
                          if (!connectedStrategy) return null
                          return (
                            <Badge key={connectedId} variant="outline" className="text-xs">
                              {connectedStrategy.name}
                            </Badge>
                          )
                        })}
                        {connectedStrategyIds.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{connectedStrategyIds.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Merge Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Merge Strategies
            </DialogTitle>
            <DialogDescription>
              Create a unified framework from {selectedStrategies.length} selected strategies
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="merge-name">Merged Strategy Name *</Label>
              <Input
                id="merge-name"
                placeholder="e.g., Day Trading Master Setup"
                value={mergeName}
                onChange={(e) => setMergeName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="merge-description">Description (Optional)</Label>
              <Textarea
                id="merge-description"
                placeholder="Describe how these strategies work together..."
                value={mergeDescription}
                onChange={(e) => setMergeDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Selected Strategies</Label>
              <div className="flex flex-wrap gap-2">
                {selectedStrategies.map(id => {
                  const strategy = strategies.find(s => s.id === id)
                  if (!strategy) return null
                  return (
                    <Badge key={id} variant="secondary" className="gap-1">
                      {strategy.name}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-600"
                        onClick={() => toggleStrategySelection(id)}
                      />
                    </Badge>
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMerge} disabled={isCreating} className="gap-2">
              <Sparkles className="w-4 h-4" />
              {isCreating ? "Creating..." : "Create Merge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
