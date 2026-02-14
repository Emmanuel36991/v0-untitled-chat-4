import { CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface SessionCardProps {
  session: {
    value: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    time: string
    description: string
    borderColor: string
    textColor: string
    bgColor: string
    iconBg: string
  }
  isSelected: boolean
  onSelect: () => void
}

export const SessionCard = ({ session, isSelected, onSelect }: SessionCardProps) => {

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col p-4 rounded-xl border-2 text-left transition-all duration-200 w-full",
        isSelected
          ? cn("bg-background shadow-md ring-1 ring-offset-0", session.borderColor)
          : "border-border bg-card/50 hover:bg-accent/50",
      )}
    >
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex items-center gap-3">
          <div>
            <h4 className={cn("font-bold text-sm", isSelected ? session.textColor : "text-foreground")}>
              {session.label}
            </h4>
            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
              {session.time}
            </span>
          </div>
        </div>
        {isSelected && (
          <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", session.textColor.split(" ")[0].replace("text-", "bg-"))}>
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{session.description}</p>
    </button>
  )
}
