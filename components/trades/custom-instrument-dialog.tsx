"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Save, AlertTriangle } from "lucide-react"
import type { CustomInstrument } from "@/types/instrument-calculations"

interface CustomInstrumentDialogProps {
  onSave: (instrument: CustomInstrument) => void
  trigger?: React.ReactNode
}

export function CustomInstrumentDialog({ onSave, trigger }: CustomInstrumentDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<CustomInstrument>({
    symbol: "",
    name: "",
    category: "other",
    multiplier: 1,
    tickSize: 0.01,
    currency: "USD",
    displayDecimals: 2,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: keyof CustomInstrument, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.symbol.trim()) {
      newErrors.symbol = "Symbol is required"
    } else if (formData.symbol.length > 10) {
      newErrors.symbol = "Symbol must be 10 characters or less"
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (formData.multiplier <= 0) {
      newErrors.multiplier = "Multiplier must be greater than 0"
    }

    if (formData.tickSize <= 0) {
      newErrors.tickSize = "Tick size must be greater than 0"
    }

    if (formData.displayDecimals < 0 || formData.displayDecimals > 8) {
      newErrors.displayDecimals = "Display decimals must be between 0 and 8"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        ...formData,
        symbol: formData.symbol.toUpperCase().trim(),
        name: formData.name.trim(),
      })
      setOpen(false)
      setFormData({
        symbol: "",
        name: "",
        category: "other",
        multiplier: 1,
        tickSize: 0.01,
        currency: "USD",
        displayDecimals: 2,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full border-dashed border-2 hover:border-indigo-300 bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Instrument
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Custom Instrument
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol *</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => handleChange("symbol", e.target.value.toUpperCase())}
                placeholder="e.g., CUSTOM"
                className={errors.symbol ? "border-red-500" : ""}
              />
              {errors.symbol && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.symbol}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="futures">Futures</SelectItem>
                  <SelectItem value="forex">Forex</SelectItem>
                  <SelectItem value="stocks">Stocks</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="commodities">Commodities</SelectItem>
                  <SelectItem value="options">Options</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., Custom Instrument"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="multiplier">P&L Multiplier *</Label>
              <Input
                id="multiplier"
                type="number"
                step="any"
                value={formData.multiplier}
                onChange={(e) => handleChange("multiplier", Number.parseFloat(e.target.value) || 1)}
                placeholder="1"
                className={errors.multiplier ? "border-red-500" : ""}
              />
              {errors.multiplier && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.multiplier}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tickSize">Tick Size *</Label>
              <Input
                id="tickSize"
                type="number"
                step="any"
                value={formData.tickSize}
                onChange={(e) => handleChange("tickSize", Number.parseFloat(e.target.value) || 0.01)}
                placeholder="0.01"
                className={errors.tickSize ? "border-red-500" : ""}
              />
              {errors.tickSize && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.tickSize}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => handleChange("currency", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                  <SelectItem value="CHF">CHF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayDecimals">Display Decimals</Label>
              <Input
                id="displayDecimals"
                type="number"
                min="0"
                max="8"
                value={formData.displayDecimals}
                onChange={(e) => handleChange("displayDecimals", Number.parseInt(e.target.value) || 2)}
                className={errors.displayDecimals ? "border-red-500" : ""}
              />
              {errors.displayDecimals && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.displayDecimals}
                </p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>P&L Calculation:</strong> Profit/Loss = Size × Multiplier × (Exit Price - Entry Price)
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Instrument
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
