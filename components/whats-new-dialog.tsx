"use client"

import { useEffect, useState } from "react"
import { Bell, X, Zap, CheckCircle2, Megaphone, Star } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { APP_UPDATES, LATEST_UPDATE_ID } from "@/lib/updates"
import { cn } from "@/lib/utils"

export function WhatsNewDialog({ 
  open, 
  onOpenChange 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  // Logic to mark read
  const handleClose = () => {
    localStorage.setItem("lastSeenUpdate", LATEST_UPDATE_ID)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden bg-background border-border shadow-2xl">
        
        {/* Header with cool background */}
        <div className="relative h-32 bg-gradient-to-r from-indigo-900 via-slate-900 to-black p-6 flex flex-col justify-end border-b border-white/10">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Megaphone className="w-24 h-24 -rotate-12 text-white" />
          </div>
          <div className="relative z-10">
            <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white border-0 mb-2 w-fit">
              <Zap className="w-3 h-3 mr-1 fill-current" /> What's New
            </Badge>
            <DialogTitle className="text-2xl font-bold text-white">System Updates & Announcements</DialogTitle>
          </div>
        </div>

        <ScrollArea className="h-[400px] bg-slate-50/50 dark:bg-black/20">
          <div className="p-6 space-y-8">
            {APP_UPDATES.map((update, index) => (
              <div key={update.id} className="relative pl-8 border-l-2 border-border/50 pb-8 last:pb-0 last:border-0">
                {/* Timeline Dot */}
                <div className={cn(
                  "absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-background",
                  index === 0 ? "bg-indigo-500 animate-pulse" : "bg-muted-foreground/30"
                )} />

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      {update.title}
                      {index === 0 && <span className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">LATEST</span>}
                    </h3>
                    <span className="text-xs text-muted-foreground font-mono">{update.date}</span>
                  </div>
                  
                  <Badge variant="outline" className="w-fit text-[10px] h-5">{update.tag}</Badge>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                    {update.description}
                  </p>

                  {update.highlights && (
                    <div className="mt-3 bg-white dark:bg-white/5 p-4 rounded-xl border border-border/50">
                      <ul className="space-y-2">
                        {update.highlights.map((highlight, i) => (
                          <li key={i} className="text-xs flex items-start gap-2 text-foreground/80">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-background flex justify-between items-center">
          <p className="text-xs text-muted-foreground">Version 2.1.0</p>
          <Button onClick={handleClose} className="bg-foreground text-background hover:bg-foreground/90">
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
