import type { Metadata } from "next"
import { LegalLayout } from "@/components/layout/legal-layout"
import { AlertTriangle, FileText, CreditCard, Users, Scale, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "Terms of Service - Concentrade",
  description: "Read Concentrade's Terms of Service to understand the rules and guidelines for using our trading journal.",
}

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <LegalLayout title="Terms of Service" lastUpdated={lastUpdated}>
      {/* Critical Disclaimer - Not Financial Advice */}
      <Alert className="mb-8 bg-yellow-50 border-yellow-400 border-2">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <AlertDescription className="text-yellow-900 font-medium ml-2">
          <strong className="block text-lg mb-2">⚠️ Important: Not Financial Advice</strong>
          Concentrade is a journaling and analysis tool for traders. We do not provide financial advice,
          investment recommendations, or trading signals. All trading decisions are your sole responsibility.
          Trading financial instruments involves substantial risk of loss. Past performance is not indicative
          of future results.
        </AlertDescription>
      </Alert>

      {/* Introduction */}
      <section id="introduction">
        <p className="lead text-lg text-slate-700 leading-relaxed">
          Welcome to Concentrade! These Terms of Service ("Terms") govern your access to and use of the
          Concentrade trading journal application, website, and related services (collectively, the "Service")
          provided by Concentrade ("we," "us," or "our").
        </p>
        <p className="text-slate-700 leading-relaxed">
          By creating an account or using the Service, you agree to be bound by these Terms and our Privacy
          Policy. If you do not agree, you may not use the Service.
        </p>
      </section>

      {/* Acceptance */}
      <section id="acceptance" className="mt-12">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-4">
          <FileText className="w-6 h-6 text-purple-600" />
          1. Acceptance of Terms
        </h2>
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <p>
            By registering for an account, accessing, or using Concentrade, you acknowledge that you have read,
            understood, and agree to be bound by these Terms and our Privacy Policy.
          </p>
          <p>
            We reserve the right to modify these Terms at any time. We will notify you of material changes via
            email or through the Service. Continued use of the Service after such notification constitutes
            acceptance of the updated Terms.
          </p>
          <p>
            <strong>You must be at least 18 years old</strong> to use the Service. By using the Service, you
            represent and warrant that you meet this age requirement.
          </p>
        </div>
      </section>

      {/* Description of Service */}
      <section id="service-description" className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Description of Service</h2>
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            Concentrade provides a comprehensive suite of tools for journaling, tracking, analyzing, and
            reflecting on your trading activities. Features include:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Manual and automated trade entry (via broker integrations like Tradovate)</li>
            <li>Trade analytics, performance metrics, and risk-reward calculations</li>
            <li>Emotional journaling and psychological pattern identification</li>
            <li>AI-powered insights and feedback (optional)</li>
            <li>Custom playbooks, tags, and filters</li>
          </ul>
          <p className="font-semibold text-slate-900 mt-4">
            The Service is for informational, educational, and journaling purposes only. It is not:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>A financial advisory service</li>
            <li>A brokerage or trading platform</li>
            <li>A source of investment recommendations or trading signals</li>
            <li>A guarantee of trading success or profitability</li>
          </ul>
        </div>
      </section>

      {/* User Accounts */}
      <section id="accounts" className="mt-12">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-4">
          <Users className="w-6 h-6 text-purple-600" />
          3. User Accounts & Security
        </h2>
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <p>
            To access most features, you must register for an account. You agree to provide accurate, current,
            and complete information during registration and to keep this information up to date.
          </p>
          <p>
            <strong>Account Security:</strong> You are responsible for safeguarding your password and for all
            activities under your account. You must notify us immediately at{" "}
            <a href="mailto:support@concentrade.com" className="text-purple-600 hover:underline">
              support@concentrade.com
            </a>{" "}
            if you suspect unauthorized access.
          </p>
          <p>
            <strong>Prohibited:</strong> You may not share your account credentials with others or allow
            multiple users to access a single account. Each user must have their own account.
          </p>
        </div>
      </section>

      {/* User Content & Ownership */}
      <section id="user-content" className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Your Content & Ownership</h2>
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <p>
            <strong>You retain full ownership</strong> of all trading data, notes, screenshots, journal entries,
            and other information you input into the Service ("User Content").
          </p>
          <p>
            By using the Service, you grant us a limited, non-exclusive, worldwide, royalty-free license to use,
            store, display, reproduce, and process your User Content solely for the purpose of:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Providing and operating the Service</li>
            <li>Generating analytics and insights for you</li>
            <li>Improving the Service (using anonymized, aggregated data)</li>
          </ul>
          <p>
            We will never sell your User Content to third parties or use it for marketing purposes without your
            explicit consent.
          </p>
        </div>
      </section>

      {/* Subscription & Payment */}
      <section id="fees" className="mt-12">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-4">
          <CreditCard className="w-6 h-6 text-purple-600" />
          5. Subscription, Fees & Cancellation
        </h2>
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Pricing & Plans</h3>
            <p>
              Certain features of the Service require a paid subscription. All fees are stated in the currency
              displayed on the pricing page (typically USD or ILS). Prices are subject to change, but we will
              notify you in advance.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Payment Terms</h3>
            <p>
              Subscriptions are billed in advance on a monthly or annual basis. Payment is processed
              automatically using the payment method you provide. By subscribing, you authorize us to charge your
              payment method.
            </p>
          </div>

          <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-lg">
            <h3 className="text-lg font-semibold text-emerald-900 mb-2">
              ✓ Easy Cancellation (Israeli Consumer Protection)
            </h3>
            <p className="text-emerald-900 mb-2">
              In compliance with Israeli consumer protection laws, you may cancel your subscription at any time
              with <strong>immediate effect</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1 text-emerald-800 ml-4">
              <li>
                Go to <strong>Settings → Subscription → Cancel Subscription</strong>
              </li>
              <li>
                Or email{" "}
                <a href="mailto:support@concentrade.com" className="underline">
                  support@concentrade.com
                </a>
              </li>
            </ul>
            <p className="text-sm text-emerald-800 mt-2">
              Upon cancellation, you will retain access to paid features until the end of your current billing
              period. No refunds are provided for partial months unless required by law.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Account Deletion</h3>
            <p>
              You can permanently delete your account and all data at any time via{" "}
              <strong>Settings → Account → Delete Account</strong>. This action is irreversible after the 30-day
              grace period.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Refund Policy</h3>
            <p>
              All fees are generally non-refundable except as required by law or in cases of billing errors. If
              you believe you are entitled to a refund, contact us within 14 days.
            </p>
          </div>
        </div>
      </section>

      {/* User Conduct */}
      <section id="conduct" className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Prohibited Conduct</h2>
        <p className="text-slate-700 leading-relaxed mb-3">You agree not to:</p>
        <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
          <li>
            <strong>Share accounts:</strong> Allow multiple individuals to use a single account
          </li>
          <li>
            <strong>Scrape or extract data:</strong> Use automated tools (bots, scrapers) to extract data from
            the Service without permission
          </li>
          <li>
            <strong>Reverse engineer:</strong> Decompile, disassemble, or attempt to derive the source code of
            the Service
          </li>
          <li>
            <strong>Resell or redistribute:</strong> Commercially resell access to the Service or redistribute
            data obtained from it
          </li>
          <li>
            <strong>Violate laws:</strong> Use the Service for any unlawful purpose or in violation of
            applicable regulations
          </li>
          <li>
            <strong>Interfere with operations:</strong> Disrupt or overload our systems, or attempt to gain
            unauthorized access
          </li>
        </ul>
        <p className="text-slate-700 leading-relaxed mt-3">
          Violation of these terms may result in immediate termination of your account without refund.
        </p>
      </section>

      {/* Intellectual Property */}
      <section id="ip" className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Intellectual Property</h2>
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <p>
            The Service, including its design, code, graphics, logos, and original content (excluding User
            Content), is the exclusive property of Concentrade and is protected by copyright, trademark, and
            other intellectual property laws.
          </p>
          <p>
            <strong>Concentrade</strong>, the Concentrade logo, and all related trademarks are the property of
            Concentrade. You may not use these without our prior written permission.
          </p>
        </div>
      </section>

      {/* Disclaimers */}
      <section id="disclaimers" className="mt-12">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-4">
          <AlertTriangle className="w-6 h-6 text-purple-600" />
          8. Disclaimers & Warranties
        </h2>
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <p className="font-semibold text-slate-900">
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind.
          </p>
          <p>We make no warranty that:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>The Service will be uninterrupted, secure, or error-free</li>
            <li>The results or data obtained will be accurate or reliable</li>
            <li>Any errors or defects will be corrected</li>
            <li>The Service will meet your specific requirements or expectations</li>
          </ul>
          <p className="font-semibold text-red-700 mt-4">
            <strong>Trading Risk:</strong> Trading financial instruments carries a high level of risk and may
            result in the loss of all your capital. Concentrade does not guarantee profitability or trading
            success. You are solely responsible for all trading decisions.
          </p>
        </div>
      </section>

      {/* Limitation of Liability */}
      <section id="liability" className="mt-12">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-4">
          <Scale className="w-6 h-6 text-purple-600" />
          9. Limitation of Liability
        </h2>
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <p>
            To the maximum extent permitted by law, Concentrade, its directors, employees, and affiliates shall
            not be liable for any:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>Trading losses:</strong> Loss of profits, capital, or trading opportunities
            </li>
            <li>
              <strong>Indirect damages:</strong> Indirect, incidental, special, consequential, or punitive
              damages
            </li>
            <li>
              <strong>Data loss:</strong> Loss of data, even if we have been advised of the possibility of such
              loss
            </li>
            <li>
              <strong>Service interruptions:</strong> Damages arising from downtime, errors, or unavailability
              of the Service
            </li>
          </ul>
          <p className="mt-4">
            <strong>Liability Cap:</strong> In no event shall our total liability to you exceed the amount you
            paid us in the 12 months preceding the claim.
          </p>
        </div>
      </section>

      {/* Indemnification */}
      <section id="indemnification" className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Indemnification</h2>
        <p className="text-slate-700 leading-relaxed">
          You agree to indemnify, defend, and hold harmless Concentrade and its affiliates from any claims,
          damages, losses, liabilities, and expenses (including legal fees) arising from:
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mt-3">
          <li>Your use of the Service</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any third-party rights</li>
          <li>Your trading decisions or activities</li>
        </ul>
      </section>

      {/* Governing Law */}
      <section id="governing-law" className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Governing Law & Dispute Resolution</h2>
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State of Israel,
            without regard to its conflict of law provisions.
          </p>
          <p>
            Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction
            of the competent courts in Tel Aviv, Israel.
          </p>
          <p className="text-sm text-slate-600">
            <strong>Alternative Dispute Resolution:</strong> Before initiating legal proceedings, we encourage
            you to contact us directly to resolve disputes amicably.
          </p>
        </div>
      </section>

      {/* Termination */}
      <section id="termination" className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Termination</h2>
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <p>
            We reserve the right to suspend or terminate your account at any time, without prior notice, for:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Violation of these Terms</li>
            <li>Fraudulent activity or abuse of the Service</li>
            <li>Non-payment of fees</li>
            <li>Any conduct that harms Concentrade or other users</li>
          </ul>
          <p>
            Upon termination, your right to access the Service will cease immediately. You may delete your
            account and data at any time via your account settings.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mt-12">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-4">
          <Mail className="w-6 h-6 text-purple-600" />
          13. Contact Us
        </h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          If you have questions about these Terms, please contact us:
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
          <p className="text-slate-800 font-medium">Concentrade Support</p>
          <p className="text-slate-700 mt-2">
            Email:{" "}
            <a href="mailto:support@concentrade.com" className="text-purple-600 hover:underline">
              support@concentrade.com
            </a>
          </p>
          <p className="text-slate-700 mt-1">
            Legal Inquiries:{" "}
            <a href="mailto:legal@concentrade.com" className="text-purple-600 hover:underline">
              legal@concentrade.com
            </a>
          </p>
        </div>
      </section>

      {/* Severability */}
      <section id="severability" className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">14. Severability</h2>
        <p className="text-slate-700 leading-relaxed">
          If any provision of these Terms is found to be unenforceable or invalid, that provision will be
          limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in
          full force and effect.
        </p>
      </section>
    </LegalLayout>
  )
}
