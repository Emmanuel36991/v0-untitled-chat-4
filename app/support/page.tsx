import type { Metadata } from "next"
import { LegalLayout } from "@/components/layout/legal-layout"
import { HelpCircle, Send, FileQuestion } from "lucide-react"
import { SupportFAQ } from "@/components/support/support-faq"
import { SupportTicketForm } from "@/components/support/support-ticket-form"

export const metadata: Metadata = {
    title: "Support Center - Concentrade",
    description: "Get help with Concentrade. Find answers in our FAQ or submit a support request.",
}

export default function SupportPage() {
    return (
        <LegalLayout title="Support Center">
            {/* Introduction */}
            <section id="introduction">
                <p className="lead text-lg text-slate-700 leading-relaxed mb-6">
                    Welcome to the Concentrade Support Center. We're here to help you get the most out of your trading
                    journal. Browse our frequently asked questions below or submit a support request if you need
                    personalized assistance.
                </p>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="mt-12">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-6">
                    <FileQuestion className="w-6 h-6 text-purple-600" />
                    Frequently Asked Questions
                </h2>
                <SupportFAQ />
            </section>

            {/* Submit Ticket */}
            <section id="submit-ticket" className="mt-12">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-6">
                    <Send className="w-6 h-6 text-purple-600" />
                    Submit a Support Request
                </h2>
                <p className="text-slate-700 leading-relaxed mb-6">
                    Can't find what you're looking for? Fill out the form below and our support team will get back to you
                    within 12-24 hours.
                </p>
                <SupportTicketForm />
            </section>

            {/* Additional Resources */}
            <section id="resources" className="mt-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Additional Resources</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    <a
                        href="/privacy"
                        className="block p-6 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:border-purple-300 transition-all"
                    >
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Privacy Policy</h3>
                        <p className="text-sm text-slate-600">Learn how we protect and handle your data</p>
                    </a>
                    <a
                        href="/terms"
                        className="block p-6 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:border-purple-300 transition-all"
                    >
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Terms of Service</h3>
                        <p className="text-sm text-slate-600">Understand the rules and guidelines for using Concentrade</p>
                    </a>
                    <a
                        href="/accessibility-statement"
                        className="block p-6 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:border-purple-300 transition-all"
                    >
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Accessibility Statement</h3>
                        <p className="text-sm text-slate-600">Our commitment to accessibility for all users</p>
                    </a>
                    <a
                        href="/contact"
                        className="block p-6 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:border-purple-300 transition-all"
                    >
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Contact Us</h3>
                        <p className="text-sm text-slate-600">Get in touch with our team directly</p>
                    </a>
                </div>
            </section>
        </LegalLayout>
    )
}
