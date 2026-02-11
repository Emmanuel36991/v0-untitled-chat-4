import { Guide } from "@/types/tutorial"

export const GUIDES: Guide[] = [
  // --- Category: Getting Started ---
  {
    id: "your-first-trade",
    slug: "your-first-trade",
    title: "Your First Trade: A Step-by-Step Walkthrough",
    description: "Learn how to log a trade correctly, including entry/exit prices and crucial psychology tags.",
    category: "Getting Started",
    readTime: 5,
    difficulty: "beginner",
    featured: true,
    content: `
# Your First Trade

Logging your first trade is the first step toward data-driven mastery. Here is how to do it correctly.

## Step 1: Click "Add Trade"
Navigate to the Dashboard or Journal view and look for the primary action button.

![Add Trade Button](/guides/first-trade.jpg)

## Step 2: Enter Trade Details
Fill in the core financial data:
- **Instrument**: e.g., NQ, ES, AAPL
- **Direction**: Long or Short
- **Entry & Exit Price**: Accurate prices are key for P&L calculations.
- **Size**: Number of contracts or shares.

## Step 3: The Most Important Part - Psychology
Before you hit save, scroll down to the "Psychology" section. This is what separates Concentrade from a basic spreadsheet.

1.  **Select Your State**: Were you Focused? Anxious? Selecting this accurately helps the engine find patterns later.
2.  **Tag Behaviors**: Did you follow your plan? Did you revenge trade? Be honest. 

![Psychology Section](/guides/first-trade.jpg)

## Step 4: Save & Review
Click "Save Trade". Your trade is now part of your permanent record, contributing to your compliance score and psychological profile.
`
  },
  {
    id: "importing-data",
    slug: "importing-data",
    title: "Importing Data: Connect Broker or Upload CSV",
    description: "seamlessly bring in your historical data from Tradovate, NinjaTrader, or other platforms.",
    category: "Getting Started",
    readTime: 8,
    difficulty: "beginner",
    content: `
# Importing Trade Data

Don't want to log everything manually? You can import your history in seconds.

## Supported Formats
- **Tradovate**: CSV export
- **NinjaTrader**: Trade report export
- **Generic CSV**: Standard format (Date, Price, Direction, etc.)

## The Import Process
1.  Go to the **Settings** or **Journal** page.
2.  Click the **"Import Trades"** button.
3.  Select your file source (e.g., "Tradovate").
4.  Upload your CSV file.

![Import Modal](/guides/importing.jpg)

## Troubleshooting Common Errors
*   **"Invalid Date Format"**: Ensure your CSV uses standard date formatting.
*   **"Duplicate Trades"**: The system automatically detects and skips trades that already exist to prevent double-counting.
`
  },

  // --- Category: The Psychology Engine ---
  {
    id: "compliance-score",
    slug: "compliance-score",
    title: "Understanding Your Compliance Score",
    description: "It's not about how much you make, it's about how well you follow your rules.",
    category: "The Psychology Engine",
    readTime: 6,
    difficulty: "intermediate",
    content: `
# The Compliance Score

Many traders confuse "winning" with "good trading". You can take a terrible, reckless trade and get lucky—that doesn't make you a good trader.

**The Compliance Score measures your discipline, not your P&L.**

## How It Works
Your score starts at 100 each week. It drops when you break your own rules.

### Negative Impact Factors
*   **Breaking Stop Loss Rules**: Large penalty.
*   **Trading During "No-Trade" Windows**: Medium penalty.
*   **Revenge Trading Tags**: If you tag a trade as "Revenge", your score takes a hit.

![Compliance Score Dashboard](/guides/compliance.jpg)

## Why It Matters
A high Compliance Score with a flat P&L is better than a low Compliance Score with high P&L. The former is sustainable; the latter is gambling.
`
  },
  {
    id: "visual-map-dna",
    slug: "visual-map-dna",
    title: "The Visual Map: Reading Your Trader DNA",
    description: "Decode the Force Graph to see hidden connections between your strategy and your emotions.",
    category: "The Psychology Engine",
    readTime: 10,
    difficulty: "intermediate",
    content: `
# Reading Your Trader DNA

The Visual Map (Force Graph) is a powerful tool to visualize connections that spreadsheets hide.

## How to Read the Graph
*   **Nodes (Circles)**: Represent concepts—Strategies, Emotions, Outcomes.
*   **Links (Lines)**: Represent the strength of the connection.

### Interpreting Clusters
Look for clusters of nodes. 
*   **The "Tilt" Cluster**: Do you see "Loss" connected tightly to "Anger" and "Increased Size"? That is a visual representation of tilt.
*   **The "Zone" Cluster**: Notice "Win" connected to "Calm" and "Plan Followed"? This is your ideal state.

![Visual Map Clusters](/guides/visual-map.jpg)

## Actionable Insights
If you see a strong link between a specific Time of Day and Losses, the map is telling you to stop trading during that hour.
`
  },

  // --- Category: Advanced Features ---
  {
    id: "custom-rules",
    slug: "custom-rules",
    title: "Setting Up Custom Rules",
    description: "Define your own boundaries. Set max daily losses, trading windows, and more.",
    category: "Advanced Features",
    readTime: 7,
    difficulty: "advanced",
    content: `
# Custom Rules Configuration

Your trading plan is unique. Your rules should be too.

## Accessing Rule Settings
Navigate to **Settings > Rules Engine**.

## Types of Rules
1.  **Time-Based**: "No trading before 09:30 AM" or "No trading after 11:00 AM".
2.  **Risk-Based**: "Max Daily Loss = $500". If you hit this, the dashboard will alert you to stop.
3.  **Size-Based**: "Max Position Size = 5 contracts".

![Rule Settings](/guides/rules.jpg)

## Active Monitoring
Once set, these rules are active. If you log a trade that violates them, it will automatically be flagged as a "Rule Violation" and impact your Compliance Score.
`
  },
  {
    id: "pre-session-calibration",
    slug: "pre-session-calibration",
    title: "The Pre-Session Calibration",
    description: "Warm up before the market opens by reviewing past mistakes and setting your intent.",
    category: "Advanced Features",
    readTime: 5,
    difficulty: "advanced",
    content: `
# Pre-Session Calibration

Top athletes warm up. Top traders calibrate.

## The Routine
Before the market opens, click the **"Calibrate"** button on your dashboard.

### 1. Review Recent Errors
The system will show you your last 3 mistakes. Ignoring this is choosing to repeat them.
*   "Yesterday you chased price."
*   "Last week you moved your stop."

### 2. Set Your Intent
Type out your simple goal for the day.
*   *Example: "I will only take A+ setups and accept losses calmly."*

### 3. Check Potential
Review the daily expected range and key levels before looking at a chart.

![Calibration Screen](/guides/calibration.jpg)

Completing this routine adds a "Calibrated" tag to your session, which statistically correlates with higher win rates.
`
  }
]
