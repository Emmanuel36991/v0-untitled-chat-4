"use client"

import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, ReferenceLine } from "recharts"

interface SetupScatterChartProps {
  data: any[]
}

export function SetupScatterChart({ data }: SetupScatterChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Win Rate" 
            unit="%" 
            domain={[0, 100]} 
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            label={{ value: "Win Rate (%)", position: "bottom", offset: 0, fill: "#94a3b8", fontSize: 12 }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Risk/Reward" 
            domain={[0, 5]} 
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            label={{ value: "Reward to Risk (R)", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 12 }}
          />
          <ZAxis type="number" dataKey="volume" range={[50, 400]} name="Volume" />
          <Tooltip 
            cursor={{ strokeDasharray: "3 3" }} 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl border border-slate-700">
                    <p className="font-bold mb-1">{data.name}</p>
                    <p>Win Rate: {data.winRate.toFixed(1)}%</p>
                    <p>PnL: ${data.pnl.toFixed(2)}</p>
                    <p>Trades: {data.volume}</p>
                  </div>
                )
              }
              return null
            }}
          />
          <ReferenceLine y={1.5} stroke="#e2e8f0" strokeDasharray="3 3" />
          <ReferenceLine x={50} stroke="#e2e8f0" strokeDasharray="3 3" />
          <Scatter name="Setups" data={data} fill="#8884d8">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
