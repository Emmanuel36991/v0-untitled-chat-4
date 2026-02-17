import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  ArrowLeft,
  FileSpreadsheet,
  Link2,
  Upload,
  Key,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Lightbulb,
  Shield,
} from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Import Trades & Connect Brokers | Concentrade",
  description:
    "Step-by-step guide: CSV import for Tradovate, Thinkorswim, TradingView, Interactive Brokers, Rithmic, NinjaTrader, and how to connect Alpaca.",
}

const csvBrokers = [
  {
    id: "tradovate",
    name: "Tradovate",
    steps: [
      "In Tradovate, go to **Reports** or the **Orders** / **Trades** section.",
      "Export your **Performance Report** (with Buy Price, Sell Price, PnL, Bought/Sold timestamps) or the **Order Log** / **Executions** grid.",
      "Save as CSV. The importer auto-detects Tradovate format; you can also choose **Tradovate** manually in the import dialog.",
    ],
    tip: "Performance Report gives pre-matched round-trips; Order/Executions exports are paired automatically (FIFO by symbol and quantity).",
  },
  {
    id: "thinkorswim",
    name: "Thinkorswim (TD Ameritrade)",
    steps: [
      "In thinkorswim (or TD Ameritrade), go to **My Account** → **History & Statements** → **Account Statement**.",
      "Select the date range and generate the statement. Download or copy the **Account Trade History** / **Trade History** section.",
      "If you export the full Account Statement as CSV, Concentrade will automatically find and parse the trade history section.",
    ],
    tip: "We look for columns like Exec Time, Symbol, Side, Net Price, Quantity. Full account statement files are supported.",
  },
  {
    id: "tradingview",
    name: "TradingView",
    steps: [
      "In TradingView, open your **Trading Panel** and go to **Account** or **History**.",
      "Export **List of Trades**, **Account History**, or **Order History** as CSV.",
      "Upload the file on the Trades page; the importer will detect TradingView format (symbol, type, date/time, P&L, fill price, etc.).",
    ],
    tip: "List of Trades, Account History, and Order History formats are all supported.",
  },
  {
    id: "interactive-brokers",
    name: "Interactive Brokers (IBKR)",
    steps: [
      "In Client Portal or TWS: **Account** → **Reports** → **Flex Queries** or **Trade Confirmation** reports.",
      "Export a **Trade Confirmation** or **Flex Query** CSV that includes: Symbol, Buy/Sell, Quantity, Price, Trade Date, Trade Time. Optional: Commission, Realized P&L.",
      "Upload the CSV on the Trades page and select **Interactive Brokers** if auto-detect doesn’t pick it.",
    ],
    tip: "We use columns such as Symbol, Buy/Sell, Quantity, Price, Trade Date, Trade Time. CONID and Asset Class help with detection.",
  },
  {
    id: "rithmic",
    name: "Rithmic (R | Trader Pro)",
    steps: [
      "In R | Trader Pro, open **Order History** or **Completed Orders** (or equivalent executions grid).",
      "Export the grid to CSV. Ensure it includes: **Order Number**, **Symbol**, **Qty Filled**, **Avg Fill Price**, **Fill Time**, and Side (or separate Buy/Sell columns).",
      "Upload the file; the importer will pair opening and closing executions by symbol and quantity.",
    ],
    tip: "Execution report exports with Execution ID, Order ID, Execution Time are also supported.",
  },
  {
    id: "ninjatrader",
    name: "NinjaTrader 8",
    steps: [
      "In NinjaTrader 8, open **Control Center** → **Executions** tab.",
      "Right-click in the Executions grid → **Share** → **Export** → **CSV**.",
      "The export should include: Instrument, Action (Buy/Sell/Sell Short/Buy to Cover), Quantity, Price, Time, and optionally Commission.",
    ],
    tip: "Use the default execution export; we map Action to entry/exit and pair by instrument and quantity.",
  },
  {
    id: "generic",
    name: "Generic CSV / Other brokers",
    steps: [
      "If your broker isn’t listed, use a CSV with at least: **Symbol**, **Side** (Buy/Sell), **Qty**, **Fill Price**, **Status** (Filled), **Placing Time**, **Order ID**.",
      "Optional: Limit Price, Stop Price, Commission, Closing Time. See the in-app **CSV format help** in the Import dialog for the full template.",
      "Choose **Generic** in the import dialog and ensure only filled orders are included; we pair Buy/Sell by symbol and quantity (FIFO).",
    ],
    tip: "Download the sample CSV from the Import dialog to match the expected headers.",
  },
]

export default function ImportAndConnectGuidePage() {
  return (
    <div className="container mx-auto py-8 space-y-8 max-w-4xl">
      <div>
        <Link href="/guides">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Guides
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Import Trades & Connect Brokers</h1>
        <p className="text-muted-foreground">
          How to add your trades to Concentrade: CSV import for each supported broker and API connection for Alpaca.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="secondary">CSV Import</Badge>
          <Badge variant="secondary">Alpaca</Badge>
          <Badge variant="outline">Trades</Badge>
        </div>
      </div>

      <Separator />

      {/* Where to import in the app */}
      <Alert className="border-primary/30 bg-primary/5">
        <Upload className="h-4 w-4 text-primary" />
        <AlertTitle>Where to import or connect in the app</AlertTitle>
        <AlertDescription>
          Go to <Link href="/trades" className="font-medium text-primary underline">Trades</Link>. Use{" "}
          <strong>Import</strong> for CSV uploads or <strong>Connect Broker</strong> to link Alpaca. You can also open
          the import dialog directly via <Link href="/trades?action=import" className="text-primary underline">Trades → Import</Link>.
        </AlertDescription>
      </Alert>

      {/* Part 1: CSV import by broker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Part 1 — CSV import by broker
          </CardTitle>
          <CardDescription>
            Export trade history from your broker as CSV, then upload it on the Trades page. Select your broker in the
            import dialog or leave &quot;Auto-detect&quot; to let the app identify the format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {csvBrokers.map((broker) => (
            <div key={broker.id} className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {broker.name}
                {broker.id === "generic" && (
                  <Badge variant="outline" className="text-xs">Template</Badge>
                )}
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                {broker.steps.map((step, i) => (
                  <li key={i} className="pl-1">
                    <span
                      className="text-foreground"
                      dangerouslySetInnerHTML={{
                        __html: step.replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground'>$1</strong>"),
                      }}
                    />
                  </li>
                ))}
              </ol>
              {broker.tip && (
                <Alert className="border-amber-500/30 bg-amber-500/5">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <AlertDescription>{broker.tip}</AlertDescription>
                </Alert>
              )}
              {broker.id !== "generic" && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Part 2: Connect Alpaca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Part 2 — Connect Alpaca (API)
          </CardTitle>
          <CardDescription>
            Link your Alpaca account to sync trades automatically. No CSV export needed. You’ll need API keys from
            Alpaca (Paper or Live).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <h3 className="text-lg font-semibold">Get Alpaca API keys</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>
              Go to{" "}
              <a
                href="https://alpaca.markets"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline inline-flex items-center gap-1"
              >
                alpaca.markets <ExternalLink className="h-3 w-3" />
              </a>{" "}
              and sign in. Create an account if you don’t have one.
            </li>
            <li>
              Open the <strong className="text-foreground">Dashboard</strong> and go to <strong className="text-foreground">API Keys</strong> (or Paper Trading → API Keys for paper).
            </li>
            <li>
              Create a new key pair. You’ll get an <strong className="text-foreground">API Key ID</strong> (starts with PK…) and a <strong className="text-foreground">Secret Key</strong>. Copy both; the secret is shown only once.
            </li>
            <li>
              For testing, use <strong className="text-foreground">Paper Trading</strong> keys. For real accounts, use <strong className="text-foreground">Live</strong> keys (same dashboard, Live section).
            </li>
          </ol>

          <Alert className="border-blue-500/30 bg-blue-500/10">
            <Shield className="h-4 w-4 text-blue-400" />
            <AlertDescription>
              Concentrade only uses your keys to <strong>read</strong> account info and trade history. We do not place
              orders or modify your account.
            </AlertDescription>
          </Alert>

          <h3 className="text-lg font-semibold">Connect in Concentrade</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>
              Go to <Link href="/trades" className="text-primary underline">Trades</Link> and click <strong className="text-foreground">Connect Broker</strong> (or the equivalent in the page header/toolbar).
            </li>
            <li>
              Choose <strong className="text-foreground">Alpaca</strong>. Enter your <strong className="text-foreground">API Key ID</strong> and <strong className="text-foreground">Secret Key</strong>.
            </li>
            <li>
              Turn <strong className="text-foreground">Paper Trading</strong> on if you’re using paper keys, off for live.
            </li>
            <li>
              Click <strong className="text-foreground">Connect to Alpaca</strong>. The app verifies the keys and shows your account (account number, equity, buying power).
            </li>
            <li>
              Click <strong className="text-foreground">Sync Trades Now</strong> to import your Alpaca trade history into Concentrade. You can sync again later to pull new trades.
            </li>
          </ol>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/trades">
              <Button className="flex items-center gap-2">
                Go to Trades
                <Upload className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/trades?action=import">
              <Button variant="outline" className="flex items-center gap-2">
                Open Import dialog
                <FileSpreadsheet className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Quick reference
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">CSV:</strong> Trades → Import → upload file → choose broker or Auto-detect → import.
          </p>
          <p>
            <strong className="text-foreground">Alpaca:</strong> Trades → Connect Broker → Alpaca → enter API Key ID + Secret → Paper/Live toggle → Connect → Sync Trades Now.
          </p>
          <p>
            Need the generic CSV template? Open the Import dialog and use the built-in <strong className="text-foreground">CSV format help</strong> or sample download.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
