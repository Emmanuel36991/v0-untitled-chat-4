"use server"

import { createClient } from "@/lib/supabase/server"

export interface MapNode {
  id: string
  label: string
  type: 'strategy' | 'setup' | 'psych_positive' | 'psych_negative'
  val: number // Size
  group: number
  stats?: {
    winRate: number
    pnl: number
    trades: number
  }
}

export interface MapLink {
  source: string
  target: string
  value: number // Thickness
  type: 'structural' | 'correlation' 
}

export async function generateEcosystemData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 1. Fetch Strategies & Setups (Corrected Table Names)
  const { data: strategies } = await supabase
    .from('playbook_strategies')
    .select(`
      id, 
      name, 
      win_rate, 
      pnl, 
      trades_count,
      setups:strategy_setups (
        id,
        name
      )
    `)
    .eq('user_id', user.id)

  // 2. Fetch Trades (Corrected Column Name: playbook_strategy_id)
  const { data: trades } = await supabase
    .from('trades')
    .select('id, playbook_strategy_id, setup_name, psychology_factors, pnl, outcome')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(200)

  if (!strategies || !trades) return { nodes: [], links: [] }

  const nodes = new Map<string, MapNode>()
  const links: MapLink[] = []

  // --- BUILD STRATEGY NODES (Roots) ---
  strategies.forEach((strat: any) => {
    // Strategy Node
    nodes.set(strat.id, {
      id: strat.id,
      label: strat.name,
      type: 'strategy',
      val: 20,
      group: 1,
      stats: { 
        winRate: strat.win_rate || 0, 
        pnl: strat.pnl || 0, 
        trades: strat.trades_count || 0 
      }
    })

    // Setup Nodes (Children)
    if (strat.setups && Array.isArray(strat.setups)) {
      strat.setups.forEach((setup: any) => {
        // Use consistent ID format for Setups to avoid collisions
        const setupNodeId = `setup-${setup.id}` 
        
        nodes.set(setupNodeId, {
          id: setupNodeId,
          label: setup.name,
          type: 'setup',
          val: 10,
          group: 2,
          stats: { winRate: 0, pnl: 0, trades: 0 } // Will be aggregated from trades
        })
        
        // Structural Link: Strategy -> Setup
        links.push({
          source: strat.id,
          target: setupNodeId,
          value: 2,
          type: 'structural'
        })
      })
    }
  })

  // --- PROCESS TRADES (Psychology Connections) ---
  trades.forEach((trade) => {
    const pnl = Number(trade.pnl) || 0
    const isWin = pnl > 0
    
    // 1. Find the parent Strategy
    const strategy = strategies.find(s => s.id === trade.playbook_strategy_id)
    if (!strategy) return

    // 2. Find the specific Setup node
    // Note: We check if the trade's setup_name matches one of the strategy's setups
    const setup = strategy.setups?.find((s: any) => s.name === trade.setup_name)
    const setupNodeId = setup ? `setup-${setup.id}` : null

    // Update Setup Node Stats (if found)
    if (setupNodeId && nodes.has(setupNodeId)) {
        const node = nodes.get(setupNodeId)!
        node.stats!.trades++
        node.stats!.pnl += pnl
        if(isWin) node.stats!.winRate++
    }

    // 3. Link Psychology
    // If we found a Setup, link Psych -> Setup. Otherwise link Psych -> Strategy directly.
    const targetId = setupNodeId || trade.playbook_strategy_id
    
    if (targetId && nodes.has(targetId) && trade.psychology_factors) {
      const factors = Array.isArray(trade.psychology_factors) 
        ? trade.psychology_factors 
        : [trade.psychology_factors]

      factors.forEach((factor: string) => {
        // Normalize ID
        const psychId = `psych-${factor.trim().toLowerCase().replace(/\s+/g, '-')}`
        
        // Create Psych Node if not exists
        if (!nodes.has(psychId)) {
          nodes.set(psychId, {
            id: psychId,
            label: factor,
            type: isWin ? 'psych_positive' : 'psych_negative', // Initial guess
            val: 5,
            group: 3,
            stats: { winRate: 0, pnl: 0, trades: 0 }
          })
        }

        // Update Psych Node Stats
        const pNode = nodes.get(psychId)!
        pNode.stats!.trades++
        pNode.stats!.pnl += pnl
        if(isWin) pNode.stats!.winRate++

        // Dynamic Coloring: Net Positive PnL = Green, Net Negative = Red
        pNode.type = pNode.stats!.pnl >= 0 ? 'psych_positive' : 'psych_negative'
        // Dynamic Sizing based on frequency
        pNode.val = Math.min(15, 5 + Math.sqrt(pNode.stats!.trades) * 2)

        // Add Correlation Link
        const existingLink = links.find(l => l.source === targetId && l.target === psychId)
        if (existingLink) {
          existingLink.value += 0.5
        } else {
          links.push({
             source: targetId,
             target: psychId,
             value: 1,
             type: 'correlation'
          })
        }
      })
    }
  })

  // Finalize Win Rates for non-strategy nodes (Strategies already have them from DB)
  nodes.forEach(node => {
    if (node.type !== 'strategy' && node.stats && node.stats.trades > 0) {
      node.stats.winRate = Math.round((node.stats.winRate / node.stats.trades) * 100)
    }
  })

  return {
    nodes: Array.from(nodes.values()),
    links: links
  }
}
