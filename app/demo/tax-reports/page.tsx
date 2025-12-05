"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calculator,
  Download,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

// Mock tax data
const taxData = {
  summary: {
    totalGains: 47230,
    shortTermGains: 28450,
    longTermGains: 18780,
    totalLosses: -12340,
    shortTermLosses: -8920,
    longTermLosses: -3420,
    washSales: -2100,
    netGains: 34890,
  },
  monthlyBreakdown: [
    { month: "Jan", shortTerm: 3200, longTerm: 1800, losses: -890 },
    { month: "Feb", shortTerm: 2100, longTerm: 2400, losses: -1200 },
    { month: "Mar", shortTerm: 4300, longTerm: 1200, losses: -800 },
    { month: "Apr", shortTerm: 1800, longTerm: 3200, losses: -1500 },
    { month: "May", shortTerm: 3900, longTerm: 2100, losses: -900 },
    { month: "Jun", shortTerm: 2800, longTerm: 1900, losses: -1100 },
    { month: "Jul", shortTerm: 3200, longTerm: 2200, losses: -1200 },
    { month: "Aug", shortTerm: 2900, longTerm: 1800, losses: -950 },
    { month: "Sep", shortTerm: 2150, longTerm: 1180, losses: -1800 },
    { month: "Oct", shortTerm: 1100, longTerm: 1000, losses: -1000 },
    { month: "Nov", shortTerm: 0, longTerm: 0, losses: -2000 },
    { month: "Dec", shortTerm: 1000, longTerm: 0, losses: 0 },
  ],
  washSaleDetails: [
    { symbol: "AAPL", date: "2024-03-15", disallowed: -450, reason: "Repurchased within 30 days" },
    { symbol: "TSLA", date: "2024-06-22", disallowed: -680, reason: "Substantially identical security" },
    { symbol: "NVDA", date: "2024-09-10", disallowed: -320, reason: "Repurchased within 30 days" },
    { symbol: "MSFT", date: "2024-11-05", disallowed: -650, reason: "Substantially identical security" },
  ],
  estimatedTax: {
    shortTermRate: 32,
    longTermRate: 15,
    shortTermTax: 9104,
    longTermTax: 2817,
    totalTax: 11921,
    effectiveRate: 25.4,
  },
}

export default function DemoTaxReports() {
  const [selectedYear, setSelectedYear] = useState("2024")
  const [reportType, setReportType] = useState("summary")

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Tax Reports</h1>
        <p className="text-gray-300">IRS-compliant tax reports generated automatically from your trades</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex gap-2">
          {["2024", "2023", "2022"].map((year) => (
            <Button
              key={year}
              variant={selectedYear === year ? "default" : "outline"}
              onClick={() => setSelectedYear(year)}
              className={selectedYear === year ? "bg-purple-600" : "border-purple-500/30 text-purple-400"}
            >
              {year}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          {[
            { id: "summary", label: "Summary" },
            { id: "detailed", label: "Detailed" },
            { id: "wash-sales", label: "Wash Sales" },
          ].map((type) => (
            <Button
              key={type.id}
              variant={reportType === type.id ? "default" : "outline"}
              onClick={() => setReportType(type.id)}
              className={reportType === type.id ? "bg-purple-600" : "border-purple-500/30 text-purple-400"}
            >
              {type.label}
            </Button>
          ))}
        </div>
        <Button className="bg-green-600 hover:bg-green-700 ml-auto">
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Tax Summary */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-800/50 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Gains</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">${taxData.summary.totalGains.toLocaleString()}</div>
            <p className="text-xs text-gray-400">Before losses</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Losses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              ${Math.abs(taxData.summary.totalLosses).toLocaleString()}
            </div>
            <p className="text-xs text-gray-400">Realized losses</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Net Gains</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">${taxData.summary.netGains.toLocaleString()}</div>
            <p className="text-xs text-gray-400">Taxable amount</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Est. Tax Owed</CardTitle>
            <Calculator className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">${taxData.estimatedTax.totalTax.toLocaleString()}</div>
            <p className="text-xs text-gray-400">{taxData.estimatedTax.effectiveRate}% effective rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Short vs Long Term */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Short-term vs Long-term</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <div className="text-white font-medium">Short-term Gains</div>
                  <div className="text-gray-400 text-sm">Held ≤ 1 year • Taxed as ordinary income</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-semibold">${taxData.summary.shortTermGains.toLocaleString()}</div>
                  <div className="text-gray-400 text-sm">
                    Tax: ${taxData.estimatedTax.shortTermTax.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <div className="text-white font-medium">Long-term Gains</div>
                  <div className="text-gray-400 text-sm">Held &gt; 1 year • Preferential tax rate</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-semibold">${taxData.summary.longTermGains.toLocaleString()}</div>
                  <div className="text-gray-400 text-sm">Tax: ${taxData.estimatedTax.longTermTax.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <div>
                  <div className="text-white font-medium">Wash Sales</div>
                  <div className="text-gray-400 text-sm">Disallowed losses</div>
                </div>
                <div className="text-right">
                  <div className="text-red-400 font-semibold">
                    ${Math.abs(taxData.summary.washSales).toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm">{taxData.washSaleDetails.length} transactions</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Breakdown Chart */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Monthly P&L Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {taxData.monthlyBreakdown.slice(0, 6).map((month, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="font-medium text-white w-12">{month.month}</div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-green-400">ST: ${month.shortTerm.toLocaleString()}</div>
                    <div className="text-blue-400">LT: ${month.longTerm.toLocaleString()}</div>
                    <div className="text-red-400">Loss: ${month.losses.toLocaleString()}</div>
                  </div>
                  <div className="text-white font-semibold">
                    ${(month.shortTerm + month.longTerm + month.losses).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wash Sales Detail */}
      {reportType === "wash-sales" && (
        <Card className="bg-slate-800/50 border-red-500/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Wash Sale Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {taxData.washSaleDetails.map((wash, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="font-semibold text-white">{wash.symbol}</div>
                    <div className="text-gray-400">{wash.date}</div>
                    <Badge className="bg-red-500/20 text-red-400">{wash.reason}</Badge>
                  </div>
                  <div className="text-red-400 font-semibold">
                    ${Math.abs(wash.disallowed).toLocaleString()} disallowed
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <div className="text-yellow-400 font-medium mb-1">Wash Sale Rule</div>
                  <div className="text-gray-300 text-sm">
                    The wash sale rule prevents you from claiming a loss if you repurchase the same or substantially
                    identical security within 30 days before or after the sale. The disallowed loss is added to the cost
                    basis of the repurchased shares.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tax Optimization Tips */}
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Tax Optimization Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <CheckCircle className="h-6 w-6 text-green-400 mb-3" />
              <h4 className="text-white font-medium mb-2">Hold for Long-term</h4>
              <p className="text-gray-300 text-sm">
                You could save $
                {(taxData.estimatedTax.shortTermTax - taxData.estimatedTax.longTermTax).toLocaleString()}
                by holding positions for over 1 year
              </p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <FileText className="h-6 w-6 text-blue-400 mb-3" />
              <h4 className="text-white font-medium mb-2">Harvest Losses</h4>
              <p className="text-gray-300 text-sm">
                Consider realizing losses before year-end to offset gains and reduce tax liability
              </p>
            </div>
            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <Calculator className="h-6 w-6 text-purple-400 mb-3" />
              <h4 className="text-white font-medium mb-2">Track Basis</h4>
              <p className="text-gray-300 text-sm">
                Accurate cost basis tracking ensures you don't overpay taxes on your gains
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
