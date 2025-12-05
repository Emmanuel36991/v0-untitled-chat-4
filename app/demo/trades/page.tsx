"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, TrendingUp, TrendingDown, Calendar, Clock, Brain, Camera, FileText } from "lucide-react"

// Mock trade journal entries
const journalEntries = [
  {
    id: 1,
    date: "2025-01-21",
    time: "09:30",
    symbol: "AAPL",
    type: "Long",
    entry: 225.5,
    exit: 228.75,
    quantity: 100,
    pnl: 325,
    emotion: "Confident",
    setup: "Breakout",
    notes: "Clean breakout above resistance with strong volume. Held position through minor pullback as planned.",
    screenshot: true,
    tags: ["breakout", "tech", "earnings-play"],
  },
  {
    id: 2,
    date: "2025-01-21",
    time: "14:15",
    symbol: "TSLA",
    type: "Short",
    entry: 412.8,
    exit: 415.2,
    quantity: 50,
    pnl: -120,
    emotion: "Frustrated",
    setup: "Failed breakdown",
    notes: "Thought it would break support but got squeezed. Should have waited for confirmation.",
    screenshot: true,
    tags: ["failed-setup", "ev", "squeeze"],
  },
  {
    id: 3,
    date: "2025-01-20",
    time: "10:45",
    symbol: "NVDA",
    type: "Long",
    entry: 875.25,
    exit: 882.5,
    quantity: 25,
    pnl: 181,
    emotion: "Excited",
    setup: "Gap and go",
    notes: "Perfect gap up on AI news. Took profits at first resistance level. Could have held longer.",
    screenshot: true,
    tags: ["gap-up", "ai", "news-driven"],
  },
  {
    id: 4,
    date: "2025-01-20",
    time: "15:30",
    symbol: "MSFT",
    type: "Long",
    entry: 445.6,
    exit: 448.9,
    quantity: 75,
    pnl: 247,
    emotion: "Calm",
    setup: "Support bounce",
    notes: "Textbook bounce off 20-day MA. Patience paid off waiting for the right entry.",
    screenshot: false,
    tags: ["support", "ma-bounce", "patient"],
  },
]

export default function DemoJournal() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEntry, setSelectedEntry] = useState<number | null>(null)

  const filteredEntries = journalEntries.filter(
    (entry) =>
      entry.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.setup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Trade Journal</h1>
        <p className="text-gray-300">Detailed records of your trading journey with insights and analysis</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search trades, setups, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800/50 border-purple-500/20 text-white"
          />
        </div>
        <Button variant="outline" className="border-purple-500/30 text-purple-400 bg-transparent">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Journal Entries */}
      <div className="space-y-6">
        {filteredEntries.map((entry) => (
          <Card key={entry.id} className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle className="text-white text-xl">{entry.symbol}</CardTitle>
                  <Badge variant={entry.type === "Long" ? "default" : "secondary"}>{entry.type}</Badge>
                  <Badge className="bg-blue-500/20 text-blue-400">{entry.setup}</Badge>
                  <Badge
                    className={`${
                      entry.emotion === "Confident"
                        ? "bg-green-500/20 text-green-400"
                        : entry.emotion === "Frustrated"
                          ? "bg-red-500/20 text-red-400"
                          : entry.emotion === "Excited"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    <Brain className="h-3 w-3 mr-1" />
                    {entry.emotion}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>{entry.date}</span>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>{entry.time}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Trade Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Entry Price</div>
                      <div className="text-white font-semibold">${entry.entry}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Exit Price</div>
                      <div className="text-white font-semibold">${entry.exit}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Quantity</div>
                      <div className="text-white font-semibold">{entry.quantity}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">P&L</div>
                      <div
                        className={`font-semibold flex items-center gap-1 ${
                          entry.pnl > 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {entry.pnl > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {entry.pnl > 0 ? "+" : ""}${entry.pnl}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-purple-500/30 text-purple-400">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes and Screenshot */}
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Trade Notes
                    </div>
                    <div className="text-gray-300 bg-slate-700/30 p-3 rounded-lg">{entry.notes}</div>
                  </div>

                  {entry.screenshot && (
                    <div>
                      <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Chart Screenshot
                      </div>
                      <div className="bg-slate-700/30 p-8 rounded-lg text-center">
                        <Camera className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                        <div className="text-gray-500">Chart screenshot would appear here</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card className="bg-slate-800/50 border-purple-500/20 mt-8">
        <CardHeader>
          <CardTitle className="text-white">Journal Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">{filteredEntries.length}</div>
              <div className="text-gray-400">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {filteredEntries.filter((e) => e.pnl > 0).length}
              </div>
              <div className="text-gray-400">Winning Trades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                ${filteredEntries.reduce((sum, e) => sum + e.pnl, 0)}
              </div>
              <div className="text-gray-400">Total P&L</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {Math.round((filteredEntries.filter((e) => e.pnl > 0).length / filteredEntries.length) * 100)}%
              </div>
              <div className="text-gray-400">Win Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
