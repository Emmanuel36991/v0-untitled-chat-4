"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import {
    EntryMarkerIcon as AddTradeIcon,
    TradeLedgerIcon,
    StrategyBlueprintIcon as PlaybookIcon,
    PatternEyeIcon,
} from "@/components/icons/hand-crafted-icons"

const QUICK_ACTIONS = [
    { label: "Add Trade", icon: AddTradeIcon, href: "/add-trade", color: "bg-primary", desc: "Log Entry" },
    { label: "Import", icon: TradeLedgerIcon, href: "/import", color: "bg-chart-5", desc: "Sync Data" },
    { label: "Playbook", icon: PlaybookIcon, href: "/playbook", color: "bg-warning", desc: "Strategies" },
    { label: "AI Insights", icon: PatternEyeIcon, href: "/analytics?tab=intelligence", color: "bg-loss", desc: "Analysis" },
] as const

export function QuickActionsGrid() {
    return (
        <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
            {QUICK_ACTIONS.map((action) => (
                <Link
                    key={action.label}
                    href={action.href}
                    className="group relative overflow-hidden rounded-2xl bg-card shadow-sm border border-border hover:shadow-xl hover:border-primary/30 transition-all duration-300 card-enhanced glass-card"
                >
                    <div className="p-4 flex flex-row items-center justify-start gap-4 relative z-10 h-full">
                        <div
                            className={cn(
                                "p-2.5 rounded-xl shadow-lg text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shrink-0",
                                action.color
                            )}
                        >
                            <action.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                            <h4 className="font-bold text-sm text-foreground leading-tight">
                                {action.label}
                            </h4>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mt-0.5">
                                {action.desc}
                            </p>
                        </div>
                    </div>
                    {/* Hover Effect */}
                    <div
                        className={cn(
                            "absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity",
                            action.color.replace("bg-", "bg-text-")
                        )}
                    />
                </Link>
            ))}
        </div>
    )
}
