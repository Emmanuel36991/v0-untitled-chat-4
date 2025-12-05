import { DevelopmentTestPanel } from "@/components/tradovate/development-test-panel"

export default function TradovateTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Tradovate API Testing</h1>
          <p className="text-gray-300">Discover and test Tradovate API endpoints</p>
        </div>

        <DevelopmentTestPanel />
      </div>
    </div>
  )
}
