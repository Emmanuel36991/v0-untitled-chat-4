import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function RootPage() {
  // השינוי החשוב: הוספת await
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  redirect("/marketing")
}
