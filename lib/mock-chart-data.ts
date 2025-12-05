import type { CandlestickData } from "@/types"

export const generateMockCandlestickData = (count = 100): CandlestickData[] => {
  const data: CandlestickData[] = []
  let lastClose = 100
  let currentTime = Math.floor(Date.now() / 1000) - count * 60 * 60 * 24 // Start `count` days ago

  for (let i = 0; i < count; i++) {
    const open = lastClose + (Math.random() - 0.5) * 5
    const close = open + (Math.random() - 0.5) * 10
    const high = Math.max(open, close) + Math.random() * 5
    const low = Math.min(open, close) - Math.random() * 5
    data.push({ time: currentTime, open, high, low, close })
    lastClose = close
    currentTime += 60 * 60 * 24 // Add one day
  }
  return data
}
