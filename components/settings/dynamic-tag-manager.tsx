"use client"

import React, { useState } from "react"
import { X, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface DynamicTagManagerProps {
  title: string
  description: string
  items: string[]
  onUpdate: (newItems: string[]) => void
  placeholder?: string
}

export function DynamicTagManager({ 
  title, 
  description, 
  items = [], 
  onUpdate,
  placeholder = "Add new..."
}: DynamicTagManagerProps) {
  const [inputValue, setInputValue] = useState("")

  const handleAdd = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    if (items.includes(trimmed)) {
      toast.error(`${trimmed} already exists`)
      return
    }
    onUpdate([...items, trimmed])
    setInputValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAdd()
    }
  }

  const handleRemove = (itemToRemove: string) => {
    onUpdate(items.filter(i => i !== itemToRemove))
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>

      <div className="flex gap-2">
        <Input 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="max-w-xs bg-white dark:bg-slate-950"
        />
        <Button onClick={handleAdd} size="sm" variant="secondary">
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 min-h-[60px]">
        {items.length === 0 && (
          <span className="text-xs text-slate-400 italic">No items added yet.</span>
        )}
        {items.map((item) => (
          <Badge key={item} variant="outline" className="pl-3 pr-1 py-1 h-7 bg-white dark:bg-slate-800 gap-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            {item}
            <button 
              onClick={() => handleRemove(item)}
              className="ml-1 p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}
