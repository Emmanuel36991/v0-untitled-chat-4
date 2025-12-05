"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export function CreateTrade() {
  return (
    <Button asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
      <Link href="/add-trade">
        <PlusCircle className="mr-2 h-4 w-4" />
        Log New Trade
      </Link>
    </Button>
  )
}
