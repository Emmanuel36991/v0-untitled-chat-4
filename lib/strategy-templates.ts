import { StrategyPhase } from "@/types"

export interface StrategyBlueprint {
  name: string
  description: string
  tags: string[]
  rules: {
    id: string
    text: string
    phase: StrategyPhase
    required: boolean
  }[]
}

export const STRATEGY_BLUEPRINTS: Record<string, StrategyBlueprint[]> = {
  "ict": [
    {
      name: "ICT Silver Bullet",
      description: "Time-based high probability setup targeting liquidity draws during specific 60-minute windows.",
      tags: ["ICT", "Time-Based", "Scalping"],
      rules: [
        { id: "ict_sb_1", text: "Time is within 10-11 AM or 3-4 PM EST", phase: "setup", required: true },
        { id: "ict_sb_2", text: "Draw on Liquidity (DOL) identified on HTF", phase: "setup", required: true },
        { id: "ict_sb_3", text: "Liquidity Sweep of previous high/low", phase: "setup", required: true },
        { id: "ict_sb_4", text: "Market Structure Shift (MSS) with displacement", phase: "confirmation", required: true },
        { id: "ict_sb_5", text: "Fair Value Gap (FVG) created", phase: "confirmation", required: true },
        { id: "ict_sb_6", text: "Entry at FVG retest", phase: "execution", required: true }
      ]
    },
    {
      name: "ICT Judas Swing",
      description: "Catching the false move at the London Open that traps traders before the real trend.",
      tags: ["ICT", "Reversal", "London"],
      rules: [
        { id: "ict_js_1", text: "Wait for London Open (2-3 AM EST)", phase: "setup", required: true },
        { id: "ict_js_2", text: "Price aggressively raids Asian High/Low", phase: "setup", required: true },
        { id: "ict_js_3", text: "Rejection / SMT Divergence at the raid", phase: "confirmation", required: true },
        { id: "ict_js_4", text: "Entry on reversal back into range", phase: "execution", required: true }
      ]
    }
  ],
  "smc": [
    {
      name: "SMC Continuation Model",
      description: "Joining an established trend after a pullback to a premium/discount array.",
      tags: ["SMC", "Trend", "Continuation"],
      rules: [
        { id: "smc_cont_1", text: "HTF Order Flow is clearly trending", phase: "setup", required: true },
        { id: "smc_cont_2", text: "Break of Structure (BOS) created", phase: "setup", required: true },
        { id: "smc_cont_3", text: "Pullback into 50% equilibrium (Discount/Premium)", phase: "confirmation", required: true },
        { id: "smc_cont_4", text: "Reaction from Order Block or Breaker", phase: "execution", required: true }
      ]
    },
    {
      name: "SMC Liquidity Sweep Reversal",
      description: "Counter-trend trade taken after a major liquidity pool is purged.",
      tags: ["SMC", "Reversal"],
      rules: [
        { id: "smc_rev_1", text: "Price takes out Major Swing High/Low", phase: "setup", required: true },
        { id: "smc_rev_2", text: "Change of Character (ChoCH) on LTF", phase: "confirmation", required: true },
        { id: "smc_rev_3", text: "Entry on the first FVG/OB after ChoCH", phase: "execution", required: true }
      ]
    }
  ],
  "wyckoff": [
    {
      name: "Wyckoff Accumulation (Spring)",
      description: "Buying the terminal shakeout of a trading range.",
      tags: ["Wyckoff", "Reversal"],
      rules: [
        { id: "wyc_acc_1", text: "Selling Climax (SC) and Auto Rally (AR) defined", phase: "setup", required: true },
        { id: "wyc_acc_2", text: "Price breaks support (The Spring)", phase: "setup", required: true },
        { id: "wyc_acc_3", text: "Quick reclamation of support level", phase: "confirmation", required: true },
        { id: "wyc_acc_4", text: "Entry on the Test of the Spring", phase: "execution", required: true }
      ]
    }
  ],
  "sr": [
    {
      name: "S/R Flip & Retest",
      description: "Classic price action: Resistance becomes Support.",
      tags: ["Classic", "Price Action"],
      rules: [
        { id: "sr_flip_1", text: "Key Level identified on HTF", phase: "setup", required: true },
        { id: "sr_flip_2", text: "Impulsive Candle closes beyond the level", phase: "confirmation", required: true },
        { id: "sr_flip_3", text: "Correction/Pullback to the level", phase: "execution", required: true },
        { id: "sr_flip_4", text: "Rejection Candle (Wick) formed", phase: "execution", required: true }
      ]
    }
  ],
  "volume": [
     {
      name: "Volume Absorption",
      description: "Trading against a level where volume is high but price isn't moving.",
      tags: ["Volume", "VSA"],
      rules: [
        { id: "vol_1", text: "Price hits Support/Resistance", phase: "setup", required: true },
        { id: "vol_2", text: "Ultra High Volume appearing", phase: "setup", required: true },
        { id: "vol_3", text: "Small candles / Wicks (Effort vs Result)", phase: "confirmation", required: true },
        { id: "vol_4", text: "Reversal candle away from level", phase: "execution", required: true }
      ]
    }
  ]
}
