import type React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Lightbulb, FileText } from "lucide-react"
import Link from "next/link"

// Simple CodeBlock component for displaying preformatted text
const SimpleCodeBlock = ({ children }: { children: React.ReactNode }) => (
  <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
    <code>{children}</code>
  </pre>
)

// Simple List components
const SimpleList = ({ children }: { children: React.ReactNode }) => (
  <ul className="list-disc space-y-1 pl-5">{children}</ul>
)
const SimpleListItem = ({ children }: { children: React.ReactNode }) => <li>{children}</li>

export function CsvImportTutorialContent() {
  const sampleCsvData = `Symbol,Side,Type,Qty,Limit Price,Stop Price,Fill Price,Status,Commission,Leverage,Margin,Placing Time,Closing Time,Order ID
BLACKBULL:NAS100,Buy,Market,1,,,"20000.50",Filled,,,,2025-06-01 10:00:00,,ORDER_BUY_1
BLACKBULL:NAS100,Sell,Market,1,,,"20050.75",Filled,,,,2025-06-01 11:30:00,,ORDER_SELL_1
EURUSD,Sell,Limit,0.5,1.07500,1.08000,"1.07500",Filled,0.50,100:1,5.38 USD,2025-06-02 08:15:20,2025-06-02 09:45:00,ORDER_SELL_EUR
EURUSD,Buy,Market,0.5,,,,"1.07250",Filled,0.50,100:1,5.36 USD,2025-06-02 09:45:00,,ORDER_BUY_EUR`

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto p-1 pr-4">
      <section>
        <h2 className="text-xl font-semibold mb-2 text-foreground flex items-center">
          <FileText className="h-6 w-6 mr-2 text-primary" />
          Understanding the CSV Format
        </h2>
        <p className="text-muted-foreground">
          The importer expects a CSV (Comma Separated Values) file where each row represents an individual filled order
          (e.g., a buy order execution or a sell order execution). The system will then attempt to pair these orders to
          create complete trades.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2 text-foreground">Required Headers</h2>
        <p className="text-muted-foreground">
          Your CSV file <strong className="text-primary">must</strong> include the following headers (case-insensitive,
          spaces will be removed):
        </p>
        <SimpleList>
          <SimpleListItem>
            <strong className="text-foreground">Symbol:</strong> The trading instrument (e.g., BLACKBULL:NAS100,
            EURUSD).
          </SimpleListItem>
          <SimpleListItem>
            <strong className="text-foreground">Side:</strong> The direction of the order. Must be &quot;Buy&quot; or
            &quot;Sell&quot;.
          </SimpleListItem>
          <SimpleListItem>
            <strong className="text-foreground">Type:</strong> The order type (e.g., Market, Limit, Stop). Used for
            notes.
          </SimpleListItem>
          <SimpleListItem>
            <strong className="text-foreground">Qty:</strong> The quantity or size of the order (e.g., 1, 0.5). Must be
            a positive number.
          </SimpleListItem>
          <SimpleListItem>
            <strong className="text-foreground">Fill Price:</strong> The price at which the order was executed. Must be
            a number.
          </SimpleListItem>
          <SimpleListItem>
            <strong className="text-foreground">Status:</strong> The status of the order. Only rows with
            &quot;Filled&quot; (case-insensitive) will be processed.
          </SimpleListItem>
          <SimpleListItem>
            <strong className="text-foreground">Placing Time:</strong> The date and time the order was placed/filled.
            Format should be recognizable by JavaScript&apos;s `new Date()` (e.g., YYYY-MM-DD HH:MM:SS, ISO 8601).
          </SimpleListItem>
          <SimpleListItem>
            <strong className="text-foreground">Order ID:</strong> A unique identifier for the order. Used for notes.
          </SimpleListItem>
        </SimpleList>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2 text-foreground">Optional Headers</h2>
        <p className="text-muted-foreground">These headers can provide additional details for your trades:</p>
        <SimpleList>
          <SimpleListItem>
            <strong className="text-foreground">Stop Price:</strong> If this order was a stop order, or if you want to
            record the stop loss for the entry order. This will be used as the `stop_loss` for the created trade if
            found on the entry order. Defaults to 0 if not a valid number.
          </SimpleListItem>
          <SimpleListItem>
            <strong className="text-foreground">Limit Price:</strong> If this order was a limit order, or if you want to
            record the take profit for the entry order. This will be used as the `take_profit` for the created trade if
            found on the entry order.
          </SimpleListItem>
          <SimpleListItem>
            <strong className="text-foreground">Commission:</strong> Any commission paid for this order. If present on
            both paired orders, the entry order's commission is prioritized for notes.
          </SimpleListItem>
          <SimpleListItem>
            <strong className="text-foreground">Leverage:</strong> Leverage used (e.g., 50:1). Added to notes.
          </SimpleListItem>
          <SimpleListItem>
            <strong className="text-foreground">Margin:</strong> Margin used (e.g., 2500 USD). Added to notes.
          </SimpleListItem>
          <SimpleListItem>
            <strong className="text-foreground">Closing Time:</strong> The time the position initiated by this order was
            closed. (Currently informational, not directly used in pairing logic beyond sorting).
          </SimpleListItem>
        </SimpleList>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2 text-foreground">Trade Pairing Logic</h2>
        <Alert variant="default" className="bg-primary/5 border-primary/20">
          <Lightbulb className="h-5 w-5 text-primary" />
          <AlertTitle className="text-primary">How Trades Are Created</AlertTitle>
          <AlertDescription className="text-primary/80">
            The system processes each &quot;Filled&quot; order from your CSV. It then tries to pair an opening order
            (e.g., a Buy) with a subsequent closing order (e.g., a Sell) for the{" "}
            <strong className="font-semibold">same symbol</strong> and
            <strong className="font-semibold"> exact quantity</strong>.
            <SimpleList>
              <SimpleListItem>A Buy order is paired with a later Sell order (Long trade).</SimpleListItem>
              <SimpleListItem>A Sell order is paired with a later Buy order (Short trade).</SimpleListItem>
              <SimpleListItem>
                Pairing is done on a First-In, First-Out (FIFO) basis for orders of the same quantity.
              </SimpleListItem>
              <SimpleListItem>
                Orders that cannot be paired (e.g., still open positions, quantity mismatches) will be listed as
                &quot;unpaired&quot; and not imported as trades.
              </SimpleListItem>
              <SimpleListItem>
                Partial fills or scaling in/out across multiple orders are not currently supported by the automatic
                pairing.
              </SimpleListItem>
            </SimpleList>
          </AlertDescription>
        </Alert>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2 text-foreground">Sample CSV Data</h2>
        <p className="text-muted-foreground">Here&apos;s an example of what a few rows in your CSV might look like:</p>
        <SimpleCodeBlock>{sampleCsvData}</SimpleCodeBlock>
        <p className="text-sm text-muted-foreground mt-2">
          You can also download a{" "}
          <Link href="/paper-trading-history-sample.csv" className="text-primary hover:underline" download>
            sample CSV file here
          </Link>
          .
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2 text-foreground">Troubleshooting</h2>
        <SimpleList>
          <SimpleListItem>
            <strong className="text-foreground">No Trades Imported:</strong> Ensure your &quot;Status&quot; column says
            &quot;Filled&quot; for relevant orders. Check that quantities match for potential pairs. Verify date
            formats.
          </SimpleListItem>
          <SimpleListItem>
            <strong className="text-foreground">Incorrect Pairing:</strong> The current logic is simple FIFO for exact
            quantities. Complex scenarios might require manual adjustment after import or a different CSV structure
            (e.g., one row per completed trade).
          </SimpleListItem>
          <SimpleListItem>
            <strong className="text-foreground">Header Mismatches:</strong> Double-check your CSV headers against the
            required list. They are case-insensitive and spaces are ignored by the parser.
          </SimpleListItem>
        </SimpleList>
      </section>
    </div>
  )
}
