"use client"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useEffect, useState } from "react"

const AnimatedTradingBackground = () => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  // Curated selection of key financial instruments
  const financialElements = [
    // Major Stocks
    { symbol: "AAPL", name: "Apple Inc.", price: "$175.43", change: "+2.34%", isPositive: true, type: "STOCK" },
    { symbol: "GOOGL", name: "Alphabet", price: "$2,847.63", change: "+1.87%", isPositive: true, type: "STOCK" },
    { symbol: "TSLA", name: "Tesla Inc.", price: "$248.50", change: "-0.92%", isPositive: false, type: "STOCK" },
    { symbol: "MSFT", name: "Microsoft", price: "$378.85", change: "+3.21%", isPositive: true, type: "STOCK" },
    { symbol: "AMZN", name: "Amazon", price: "$3,467.42", change: "+0.76%", isPositive: true, type: "STOCK" },
    { symbol: "NVDA", name: "NVIDIA", price: "$875.28", change: "+4.15%", isPositive: true, type: "STOCK" },

    // Major Indices
    { symbol: "SPX", name: "S&P 500", price: "4,567.89", change: "+1.45%", isPositive: true, type: "INDEX" },
    { symbol: "DJI", name: "Dow Jones", price: "35,421.67", change: "+0.89%", isPositive: true, type: "INDEX" },
    { symbol: "NDX", name: "NASDAQ", price: "15,234.56", change: "+2.12%", isPositive: true, type: "INDEX" },

    // Major Cryptocurrencies
    { symbol: "BTC", name: "Bitcoin", price: "$67,234", change: "+3.45%", isPositive: true, type: "CRYPTO" },
    { symbol: "ETH", name: "Ethereum", price: "$3,892", change: "+2.17%", isPositive: true, type: "CRYPTO" },
    { symbol: "SOL", name: "Solana", price: "$198.45", change: "-1.89%", isPositive: false, type: "CRYPTO" },
  ]

  const fixedPositions = [
    { left: "25%", top: "20%" },
    { left: "45%", top: "35%" },
    { left: "65%", top: "50%" },
    { left: "35%", top: "65%" },
    { left: "55%", top: "80%" },
    { left: "75%", top: "25%" },
    { left: "30%", top: "45%" },
    { left: "50%", top: "60%" },
  ]

  // Create animation configurations for sparse, slow-moving elements
  const createAnimationConfig = () => {
    const configs = []
    const directions = [
      { name: "leftToRight", from: "-300px", to: "calc(100vw + 300px)", axis: "translateX" },
      { name: "rightToLeft", from: "calc(100vw + 300px)", to: "-300px", axis: "translateX" },
      { name: "topToBottom", from: "-200px", to: "calc(100vh + 200px)", axis: "translateY" },
      { name: "bottomToTop", from: "calc(100vh + 200px)", to: "-200px", axis: "translateY" },
      { name: "diagonalTLBR", from: "-300px", to: "calc(100vw + 300px)", axis: "both", startY: "10%", endY: "90%" },
      { name: "diagonalTRBL", from: "calc(100vw + 300px)", to: "-300px", axis: "both", startY: "10%", endY: "90%" },
    ]

    // Create only 12 total elements with long delays between them
    financialElements.forEach((element, index) => {
      const direction = directions[index % directions.length]
      const baseDelay = index * 8 // 8 second intervals between elements

      configs.push({
        ...element,
        id: `element-${index}`,
        direction: direction.name,
        from: direction.from,
        to: direction.to,
        axis: direction.axis,
        startY: direction.startY || `${20 + (index % 5) * 15}%`, // Varied vertical positions
        endY: direction.endY || `${20 + (index % 5) * 15}%`,
        delay: `${baseDelay}s`,
        duration: `${25 + (index % 3) * 5}s`, // 25-35 second durations for very slow movement
        opacity: 0.15 + (index % 3) * 0.05, // Varied opacity between 0.15-0.25
      })
    })

    return configs
  }

  const animationConfigs = createAnimationConfig()

  const getElementStyle = (config: any) => {
    const baseStyle = {
      animationDelay: config.delay,
      animationDuration: config.duration,
      animationIterationCount: "infinite" as const,
      animationTimingFunction: "linear" as const,
      opacity: config.opacity,
    }

    const getPositionIndex = (configId: string) => {
      const index = Number.parseInt(configId.split("-")[1] || "0")
      return index % fixedPositions.length
    }

    switch (config.direction) {
      case "leftToRight":
        return {
          ...baseStyle,
          left: config.from,
          top: config.startY,
          animation: `slideLeftToRight ${config.duration} linear infinite`,
          animationDelay: config.delay,
        }
      case "rightToLeft":
        return {
          ...baseStyle,
          right: config.from.replace("calc(100vw + 300px)", "0px").replace("-300px", "calc(100vw + 300px)"),
          top: config.startY,
          animation: `slideRightToLeft ${config.duration} linear infinite`,
          animationDelay: config.delay,
        }
      case "topToBottom":
        return {
          ...baseStyle,
          left: fixedPositions[getPositionIndex(config.id)].left,
          top: config.from,
          animation: `slideTopToBottom ${config.duration} linear infinite`,
          animationDelay: config.delay,
        }
      case "bottomToTop":
        return {
          ...baseStyle,
          left: fixedPositions[getPositionIndex(config.id)].left,
          bottom: config.from.replace("calc(100vh + 200px)", "0px").replace("-200px", "calc(100vh + 200px)"),
          animation: `slideBottomToTop ${config.duration} linear infinite`,
          animationDelay: config.delay,
        }
      case "diagonalTLBR":
        return {
          ...baseStyle,
          left: config.from,
          top: config.startY,
          animation: `slideDiagonalTLBR ${config.duration} linear infinite`,
          animationDelay: config.delay,
        }
      case "diagonalTRBL":
        return {
          ...baseStyle,
          right: config.from.replace("calc(100vw + 300px)", "0px").replace("-300px", "calc(100vw + 300px)"),
          top: config.startY,
          animation: `slideDiagonalTRBL ${config.duration} linear infinite`,
          animationDelay: config.delay,
        }
      default:
        return baseStyle
    }
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/25 to-purple-900/35"></div>

      {/* Sparse Financial Elements */}
      {animationConfigs.map((config) => (
        <div key={config.id} className="absolute whitespace-nowrap" style={getElementStyle(config)}>
          {/* Simple text-based financial element */}
          <div className="flex items-center gap-3 text-white/80 font-mono">
            {/* Type label */}
            <span className="text-xs font-bold text-white/60 tracking-wider">{config.type}</span>

            {/* Symbol */}
            <span className="text-lg font-bold text-white drop-shadow-lg">{config.symbol}</span>

            {/* Price */}
            <span className="text-sm font-semibold text-white/90 drop-shadow-sm">{config.price}</span>

            {/* Change with arrow */}
            <span
              className={`text-sm font-bold flex items-center gap-1 drop-shadow-sm ${
                config.isPositive ? "text-emerald-300" : "text-red-300"
              }`}
            >
              {config.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {config.change}
            </span>
          </div>
        </div>
      ))}

      {/* Minimal ambient particles for depth */}
      <div className="absolute inset-0">
        {fixedPositions.map((pos, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-white/10 rounded-full animate-pulse"
            style={{
              left: pos.left,
              top: pos.top,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${4 + (i % 3) * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default AnimatedTradingBackground
export { AnimatedTradingBackground }
