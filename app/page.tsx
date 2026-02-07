import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ConcentradeLogo } from "@/components/concentrade-logo"

export default function RootPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="text-center space-y-6">
        <ConcentradeLogo size={64} />
        <h1 className="text-3xl font-bold text-slate-900">Concentrade</h1>
        <p className="text-slate-600 max-w-md">
          Your professional trading journal with advanced analytics
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
            <Link href="/login">Login to Concentrade</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
