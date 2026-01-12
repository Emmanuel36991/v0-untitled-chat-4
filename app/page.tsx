// This is the new root page. It will redirect to the marketing page.
import { redirect } from "next/navigation"

export default function RootPage() {
  redirect("/marketing")
  // Note: redirect() must be called outside of a try/catch block.
  // It's also good practice for it to be the last thing in a component or function if it's meant to always redirect.
  // Since this component's sole purpose is to redirect, this is fine.
  // Next.js will handle the rest. You don't need to return JSX here.
}
