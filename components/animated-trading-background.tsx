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

const AnimatedTradingBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/25 to-purple-900/35"></div>

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
