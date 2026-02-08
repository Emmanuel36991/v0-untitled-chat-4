"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Send, CheckCircle2 } from "lucide-react"

export function SupportTicketForm() {
    const [submitted, setSubmitted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500))

        setIsSubmitting(false)
        setSubmitted(true)

        // Reset after 5 seconds
        setTimeout(() => {
            setSubmitted(false)
                ; (e.target as HTMLFormElement).reset()
        }, 5000)
    }

    if (submitted) {
        return (
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-lg p-8 text-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-emerald-900 mb-2">Request Submitted!</h3>
                <p className="text-emerald-700">
                    We've received your support request and will respond within 12-24 hours at the email address you
                    provided.
                </p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-6">
            {/* Category */}
            <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-900 font-medium">
                    Category <span className="text-red-500">*</span>
                </Label>
                <Select name="category" required>
                    <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="billing">Billing & Subscriptions</SelectItem>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="privacy">Data Privacy & Security</SelectItem>
                        <SelectItem value="integration">Broker Integration</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-900 font-medium">
                    Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                    className="bg-white"
                />
                <p className="text-xs text-slate-600">We'll respond to this email address</p>
            </div>

            {/* Subject */}
            <div className="space-y-2">
                <Label htmlFor="subject" className="text-slate-900 font-medium">
                    Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="Brief description of your issue"
                    required
                    className="bg-white"
                />
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-900 font-medium">
                    Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="description"
                    name="description"
                    placeholder="Please provide as much detail as possible about your issue or request..."
                    rows={6}
                    required
                    className="bg-white resize-none"
                />
                <p className="text-xs text-slate-600">
                    Include steps to reproduce the issue, error messages, or screenshots if applicable
                </p>
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold h-12"
            >
                {isSubmitting ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Submit Request
                    </div>
                )}
            </Button>

            <p className="text-xs text-slate-500 text-center">
                For urgent billing issues, email us directly at{" "}
                <a href="mailto:support@concentrade.com" className="text-purple-600 hover:underline">
                    support@concentrade.com
                </a>
            </p>
        </form>
    )
}
