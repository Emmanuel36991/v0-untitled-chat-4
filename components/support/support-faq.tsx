"use client"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
    {
        question: "How do I import trades from my broker?",
        answer:
            "Concentrade supports multiple import methods: (1) **Tradovate Integration**: Connect your Tradovate account via Settings → Integrations → Tradovate for automatic trade sync. (2) **Manual Entry**: Add trades individually using the 'Add Trade' button. (3) **CSV Upload**: Export trades from your broker as a CSV file and import via Dashboard → Import Trades. Supported formats include Tradovate, TradingView, and generic CSV templates.",
    },
    {
        question: "What is your refund policy?",
        answer:
            "All subscription fees are generally non-refundable. However, if you experience technical issues that prevent you from using the Service, or if there's a billing error, please contact us at support@concentrade.com within 14 days for a review. Refunds are handled on a case-by-case basis in accordance with Israeli consumer protection laws.",
    },
    {
        question: "How secure is my trading data?",
        answer:
            "We take security seriously. All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. Your data is stored on secure Supabase servers with role-based access controls. We never share your trading data with third parties except as disclosed in our Privacy Policy. AI analysis (optional) uses anonymized data only—your email, name, and user ID are stripped before processing.",
    },
    {
        question: "How do I export or download my data?",
        answer:
            "You can export all your data at any time by going to **Settings → Privacy → Export My Data**. Your data will be provided in JSON format, which is machine-readable and can be imported into other tools. This complies with your GDPR right to data portability. Exports typically complete within a few minutes.",
    },
    {
        question: "How do I delete my account?",
        answer:
            "To permanently delete your account and all associated data, go to **Settings → Account → Delete Account**. You'll be asked to confirm this action. Once confirmed, your data enters a 30-day grace period during which you can restore it. After 30 days, all data is permanently deleted from our systems, including backups. Alternatively, email privacy@concentrade.com to request deletion.",
    },
    {
        question: "Can I cancel my subscription anytime?",
        answer:
            "Yes! In compliance with Israeli consumer protection laws, you can cancel your subscription at any time with no penalties. Go to **Settings → Subscription → Cancel Subscription**. Upon cancellation, you'll retain access to paid features until the end of your current billing period. No refunds are provided for unused portions of the billing cycle unless required by law.",
    },
    {
        question: "What broker integrations do you support?",
        answer:
            "Currently, we support **Tradovate** for automated trade imports. You can connect your Tradovate account via Settings → Integrations. We're actively working on integrations with other popular brokers like Interactive Brokers, TD Ameritrade, and MetaTrader. In the meantime, you can manually import trades via CSV or enter them individually.",
    },
    {
        question: "Do you provide financial advice or trading signals?",
        answer:
            "**No.** Concentrade is a journaling and analysis tool only. We do not provide financial advice, investment recommendations, or trading signals. All insights, analytics, and AI-powered feedback are for educational and self-reflection purposes. You are solely responsible for all trading decisions. Trading involves substantial risk of loss.",
    },
    {
        question: "How does the AI analysis feature work?",
        answer:
            "Our AI-powered insights analyze your trade history to identify patterns, suggest improvements, and highlight psychological tendencies. The AI uses OpenAI/Groq models. **Important:** Before sending data to AI providers, we anonymize it by removing your name, email, user ID, and any personally identifiable information. Only trade metrics, timestamps, and journal notes are analyzed. You can opt out of AI features in Settings.",
    },
    {
        question: "What happens if I cancel my subscription but want to keep my data?",
        answer:
            "If you cancel your subscription, you'll be downgraded to our free tier (if available) and lose access to premium features. However, **your trade data remains intact** and accessible in read-only mode. You can always re-subscribe to regain full access. If you want to delete your data entirely, use the 'Delete Account' option.",
    },
]

export function SupportFAQ() {
    return (
        <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
                <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border border-slate-200 rounded-lg px-6 bg-white hover:bg-slate-50 transition-colors"
                >
                    <AccordionTrigger className="text-left text-slate-900 font-medium hover:no-underline py-4">
                        {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-700 leading-relaxed pb-4 prose prose-slate max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}
