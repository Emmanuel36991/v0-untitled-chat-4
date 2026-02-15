import { CheckCircle, BookOpen, Crosshair, Zap, Layers, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StrategyItemCardProps {
  title: string
  description?: string
  tags: string[]
  isSelected: boolean
  onToggle: () => void
  winRate: number
}

export const StrategyItemCard = ({
  title,
  description,
  tags,
  isSelected,
  onToggle,
  winRate
}: StrategyItemCardProps) => {
  let Icon = BookOpen
  if (tags?.some(t => t.toLowerCase().includes("ict"))) Icon = Crosshair
  else if (tags?.some(t => t.toLowerCase().includes("smc"))) Icon = Zap
  else if (tags?.some(t => t.toLowerCase().includes("wyckoff"))) Icon = Layers
  else if (tags?.some(t => t.toLowerCase().includes("volume"))) Icon = BarChart3

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative flex flex-col items-start p-5 rounded-xl border-2 text-left transition-all duration-300 w-full group",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary",
        isSelected
          ? "bg-primary/5 border-primary ring-1 ring-primary shadow-lg shadow-primary/10"
          : "bg-card border-border/60 hover:bg-accent/30 hover:border-primary/30"
      )}
    >
      <div className="flex justify-between w-full mb-3">
        <div className={cn("p-2 rounded-lg border shadow-sm transition-colors", isSelected ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted/30 border-border text-muted-foreground group-hover:text-primary")}>
          <Icon className="w-5 h-5" />
        </div>
        {isSelected && (
          <div className="bg-primary text-primary-foreground rounded-full p-1 shadow-sm animate-in zoom-in duration-300">
            <CheckCircle className="w-4 h-4" />
          </div>
        )}
      </div>

      <h4 className={cn("font-bold text-base mb-1 leading-tight tracking-tight", isSelected ? "text-primary" : "text-foreground")}>
        {title}
      </h4>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 h-8 leading-relaxed font-medium">
        {description || "No description provided."}
      </p>

      <div className="flex items-center justify-between w-full mt-auto pt-3 border-t border-dashed border-border/50">
        <div className="flex gap-1.5 overflow-hidden">
          {tags?.slice(0, 3).map(t => (
            <Badge key={t} variant="secondary" className="text-[9px] px-1.5 h-5 font-bold bg-muted/50 border border-border/50 text-muted-foreground">{t}</Badge>
          ))}
        </div>
        <span className={cn("text-2xs font-mono font-bold", (winRate || 0) > 50 ? "text-profit" : "text-muted-foreground")}>{winRate || 0}% WR</span>
      </div>
    </button>
  )
}
