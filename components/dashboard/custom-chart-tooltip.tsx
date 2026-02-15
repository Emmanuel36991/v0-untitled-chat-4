import { cn } from "@/lib/utils"
import { formatCurrencyValue } from "@/lib/currency-config"

export const CustomChartTooltip = ({
  active,
  payload,
  label,
  currency = false,
  currencyCode = "USD",
  convertFn,
}: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-xl z-50">
        <p className="text-xs font-medium text-muted-foreground mb-2 border-b border-border pb-1">
          {label}
        </p>
        {payload.map((entry: any, index: number) => {
          const value = typeof entry.value === "number" && convertFn
            ? convertFn(entry.value)
            : entry.value

          return (
            <div key={index} className="flex items-center justify-between gap-4 py-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <p className="text-xs font-medium text-foreground/80 capitalize">
                  {entry.name === "cumulativePnl" ? "Net P&L" : entry.name}
                </p>
              </div>
              <p
                className={cn(
                  "text-xs font-bold font-mono",
                  typeof value === "number" && value > 0
                    ? "text-profit"
                    : typeof value === "number" && value < 0
                      ? "text-loss"
                      : "text-foreground"
                )}
              >
                {typeof value === "number"
                  ? formatCurrencyValue(value, currencyCode as any, { showSign: true })
                  : value}
              </p>
            </div>
          )
        })}
      </div>
    )
  }
  return null
}
