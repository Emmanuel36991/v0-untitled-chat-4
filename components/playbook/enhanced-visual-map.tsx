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
  Layers,
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

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Network className="w-5 h-5 text-primary" />
            </div>
            Strategy Relationships
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Connect and merge strategies to see unified insights
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowMergeDialog(true)}
          disabled={selectedStrategies.length < 2}
          className="gap-1.5 font-semibold shadow-sm"
        >
          <GitMerge className="w-4 h-4" />
          Merge Selected ({selectedStrategies.length})
        </Button>
      </div>

      {/* Merged Strategies Section */}
      {mergedStrategies.length > 0 && (
        <div className="space-y-4 animate-fade-in-up">
          <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-success" />
            Merged Strategy Groups
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mergedStrategies.map((merged, i) => (
              <Card key={merged.id} className="border border-success/30 bg-card overflow-hidden animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <div className="p-1.5 bg-success/10 rounded-lg">
                          <GitMerge className="w-3.5 h-3.5 text-success" />
                        </div>
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
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">MERGED STRATEGIES</Label>
                    <div className="flex flex-wrap gap-2">
                      {merged.strategies.map(strategy => (
                        <Badge key={strategy.id} variant="secondary" className="gap-1 text-[10px] font-mono">
                          <Target className="w-3 h-3" />
                          {strategy.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Combined Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/30">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Win Rate</div>
                      <div className="text-lg font-bold font-mono text-success">
                        {(merged.combined_win_rate * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/30">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Profit Factor</div>
                      <div className="text-lg font-bold font-mono text-info">
                        {merged.combined_profit_factor.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/30">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Trades</div>
                      <div className="text-lg font-bold font-mono text-foreground">{merged.combined_trades_count}</div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/30">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Combined P&L</div>
                      <div className={cn(
                        "text-lg font-bold font-mono",
                        merged.combined_pnl >= 0 ? "text-success" : "text-destructive"
                      )}>
                        ${merged.combined_pnl.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Common Good Habits */}
                  {merged.common_good_habits && merged.common_good_habits.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-success flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        COMMON GOOD HABITS
                      </Label>
                      <div className="flex flex-wrap gap-1.5">
                        {merged.common_good_habits.map((habit, idx) => (
                          <Badge key={idx} className="badge-animated bg-success/15 text-success border border-success/20 text-[10px]">
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
        <div className="mt-6 animate-fade-in-up stagger-2">
          <StrategyNetworkGraph
            strategies={strategies}
            mergedStrategies={mergedStrategies}
            relationships={relationships}
          />
        </div>
      )}

      {/* Individual Strategies with Connection Indicators */}
      <div className="space-y-4 animate-fade-in-up stagger-3">
        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Individual Strategies
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((strategy, i) => {
            const connectedStrategyIds = getConnectedStrategies(strategy.id)
            const isSelected = selectedStrategies.includes(strategy.id)

            return (
              <Card
                key={strategy.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 relative overflow-hidden hover:border-primary/25 hover:-translate-y-0.5 hover:shadow-md animate-fade-in-up",
                  isSelected && "ring-2 ring-primary bg-primary/5",
                  connectedStrategyIds.length > 0 && "border-success/30"
                )}
                style={{ animationDelay: `${i * 60}ms` }}
                onClick={() => toggleStrategySelection(strategy.id)}
              >
                {/* Connection Indicator */}
                {connectedStrategyIds.length > 0 && (
                  <div className="absolute top-2 right-2">
                    <Badge className="badge-animated bg-success/15 text-success border border-success/20 gap-1 text-[10px]">
                      <Link2 className="w-3 h-3" />
                      {connectedStrategyIds.length}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Checkbox checked={isSelected} className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-bold truncate">{strategy.name}</CardTitle>
                      {strategy.description && (
                        <CardDescription className="text-[11px] mt-1 line-clamp-2">
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
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Win Rate</div>
                      <div className="font-bold font-mono text-success">
                        {(strategy.win_rate * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Trades</div>
                      <div className="font-bold font-mono text-foreground">{strategy.trades_count}</div>
                    </div>
                  </div>

                  {/* Connected Strategies */}
                  {connectedStrategyIds.length > 0 && (
                    <div className="pt-2 border-t border-border">
                      <Label className="text-[10px] text-muted-foreground mb-1 block">Connected to:</Label>
                      <div className="flex flex-wrap gap-1">
                        {connectedStrategyIds.slice(0, 2).map(connectedId => {
                          const connectedStrategy = strategies.find(s => s.id === connectedId)
                          if (!connectedStrategy) return null
                          return (
                            <Badge key={connectedId} variant="outline" className="text-[10px] font-mono">
                              {connectedStrategy.name}
                            </Badge>
                          )
                        })}
                        {connectedStrategyIds.length > 2 && (
                          <Badge variant="outline" className="text-[10px] font-mono">
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
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <div className="p-1.5 bg-success/10 rounded-lg">
                <GitMerge className="w-4 h-4 text-success" />
              </div>
              Merge Strategies
            </DialogTitle>
            <DialogDescription className="text-xs">
              Create a unified framework from {selectedStrategies.length} selected strategies
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="merge-name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Merged Strategy Name *</Label>
              <Input
                id="merge-name"
                placeholder="e.g., Day Trading Master Setup"
                value={mergeName}
                onChange={(e) => setMergeName(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="merge-description" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description (Optional)</Label>
              <Textarea
                id="merge-description"
                placeholder="Describe how these strategies work together..."
                value={mergeDescription}
                onChange={(e) => setMergeDescription(e.target.value)}
                rows={3}
                className="bg-background resize-none text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Selected Strategies</Label>
              <div className="flex flex-wrap gap-2">
                {selectedStrategies.map(id => {
                  const strategy = strategies.find(s => s.id === id)
                  if (!strategy) return null
                  return (
                    <Badge key={id} variant="secondary" className="gap-1 text-xs">
                      {strategy.name}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors"
                        onClick={() => toggleStrategySelection(id)}
                      />
                    </Badge>
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowMergeDialog(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateMerge} disabled={isCreating} className="gap-1.5 font-semibold shadow-sm">
              <GitMerge className="w-3.5 h-3.5" />
              {isCreating ? "Creating..." : "Create Merge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
