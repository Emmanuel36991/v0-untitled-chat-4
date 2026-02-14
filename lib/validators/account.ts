import { z } from "zod"

export const createAccountSchema = z.object({
    name: z.string().min(1, "Account name is required").max(50),
    type: z.enum(["personal", "funded", "challenge", "demo"]),
    initial_balance: z.number().positive("Initial balance must be positive"),
    currency: z.string().length(3).optional(),
    is_default: z.boolean().optional(),
})

export type CreateAccountSchema = z.infer<typeof createAccountSchema>
