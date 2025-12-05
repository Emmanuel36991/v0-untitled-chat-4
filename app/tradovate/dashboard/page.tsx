import { redirect } from "next/navigation"
import { getTradovateSession, getTradovateAccountInfo } from "@/app/actions/tradovate-actions"
import { TradovateDashboard } from "@/components/tradovate/tradovate-dashboard"

// Force dynamic rendering for this page since it uses cookies
export const dynamic = "force-dynamic"

export default async function TradovateDashboardPage() {
  const session = await getTradovateSession()

  if (!session) {
    redirect("/tradovate/login")
  }

  const accountInfo = await getTradovateAccountInfo()

  return <TradovateDashboard session={session} accountInfo={accountInfo.success ? accountInfo : null} />
}
