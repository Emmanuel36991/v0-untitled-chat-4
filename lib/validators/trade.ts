import { z } from "zod"

export const tradeSchema = z.object({
    account_id: z.string().optional().nullable(),
    date: z.string().min(1, "Date is required"),
    instrument: z.string().min(1, "Instrument is required"),
    direction: z.enum(["long", "short"]),
    entry_price: z.number().positive("Entry price must be positive"),
    exit_price: z.number().positive("Exit price must be positive"),
    stop_loss: z.number().min(0, "Stop loss cannot be negative").optional().nullable(),
    take_profit: z.number().positive().optional().nullable(),
    size: z.number().positive("Size must be positive"),
    pnl: z.number().nullable().optional(),
    outcome: z.enum(["win", "loss", "breakeven"]).optional(),
    setupName: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    screenshotBeforeUrl: z.string().url().optional().nullable(),
    screenshotAfterUrl: z.string().url().optional().nullable(),
    // Strategy
    playbook_strategy_id: z.string().uuid().optional().nullable(),
    executed_rules: z.array(z.string()).optional().nullable(),
    // Timing
    entry_time: z.string().datetime({ offset: true }).optional().nullable(), // Expecting ISO string
    exit_time: z.string().datetime({ offset: true }).optional().nullable(),
    tradeSession: z.string().optional().nullable(),
    // Psychology
    psychologyFactors: z.array(z.string()).optional().nullable(),
    goodHabits: z.array(z.string()).optional().nullable(),
})

export type TradeSchema = z.infer<typeof tradeSchema>
