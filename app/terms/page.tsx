import type { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck, ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service - TradeOkev",
  description: "Read the Terms of Service for using the TradeOkev application.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground futuristic-cyber-grid p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/marketing"
            className="inline-flex items-center text-sm font-medium text-futuristic-muted-foreground hover:text-futuristic-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Main Page
          </Link>
        </div>

        <div className="futuristic-glass-pane rounded-xl border-futuristic-border/50 shadow-2xl shadow-black/20">
          <div className="p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 pb-6 border-b border-futuristic-border/50">
              <ShieldCheck className="w-12 h-12 text-futuristic-primary shrink-0" />
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold futuristic-text-gradient">Terms of Service</h1>
                <p className="text-futuristic-muted-foreground mt-1">
                  Last Updated:{" "}
                  {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>

            <div className="prose prose-lg prose-invert max-w-none text-futuristic-muted-foreground prose-headings:text-futuristic-foreground prose-strong:text-futuristic-foreground prose-a:text-futuristic-primary hover:prose-a:text-futuristic-secondary">
              <p>
                Welcome to TradeOkev! These Terms of Service ("Terms") govern your access to and use of the TradeOkev
                application, website, and services (collectively, the "Service") provided by TradeOkev ("we," "us," or
                "our"). Please read these Terms carefully before using the Service.
              </p>

              <h2 id="acceptance">1. Acceptance of Terms</h2>
              <p>
                By creating an account, accessing, or using our Service, you agree to be bound by these Terms and our
                Privacy Policy. If you do not agree to these Terms, you may not use the Service. We reserve the right to
                modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page.
              </p>

              <h2 id="service-description">2. Description of Service & Disclaimer</h2>
              <p>
                TradeOkev provides a sophisticated suite of tools for journaling, tracking, and analyzing your trading
                activities ("Service"). The Service is for informational and educational purposes only.
              </p>
              <p>
                <strong>
                  We are not a financial advisor, broker, or dealer. The information and tools provided through the
                  Service should not be construed as financial, investment, tax, or legal advice.
                </strong>{" "}
                Trading financial instruments involves substantial risk of loss and is not suitable for every investor.
                You are solely responsible for your own trading decisions and outcomes.
              </p>

              <h2 id="accounts">3. User Accounts</h2>
              <p>
                To access most features of the Service, you must register for an account. You agree to provide accurate,
                current, and complete information during the registration process. You are responsible for safeguarding
                your password and for all activities that occur under your account. You must notify us immediately of
                any unauthorized use of your account.
              </p>

              <h2 id="user-content">4. Your Content</h2>
              <p>
                You retain full ownership of all the trading data, notes, and other information you input into the
                Service ("User Content"). By using the Service, you grant us a limited, non-exclusive, worldwide,
                royalty-free license to use, store, display, reproduce, and process your User Content solely for the
                purpose of operating and providing the Service to you. We will treat your User Content as confidential
                information in accordance with our Privacy Policy.
              </p>

              <h2 id="fees">5. Fees and Payment</h2>
              <p>
                Certain features of the Service may be provided for a fee. You agree to pay all applicable fees for the
                plans you select. All fees are in U.S. Dollars and are non-refundable except as required by law or as
                stated in our refund policy.
              </p>

              <h2 id="ip">6. Intellectual Property</h2>
              <p>
                The Service and its original content (excluding User Content), features, and functionality are and will
                remain the exclusive property of TradeOkev and its licensors. The Service is protected by copyright,
                trademark, and other laws of both the United States and foreign countries.
              </p>

              <h2 id="disclaimer-warranties">7. Disclaimer of Warranties</h2>
              <p>
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranty that the Service
                will meet your requirements, be available on an uninterrupted, secure, or error-free basis, or that the
                information obtained from it will be accurate or reliable.
              </p>

              <h2 id="limitation-liability">8. Limitation of Liability</h2>
              <p>
                In no event shall TradeOkev, its directors, employees, or partners be liable for any indirect,
                incidental, special, consequential, or punitive damages, including without limitation, loss of profits,
                data, or other intangible losses, resulting from your use of the Service or any trading decisions made
                based on information from the Service.
              </p>

              <h2 id="governing-law">9. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of the State of Delaware, United
                States, without regard to its conflict of law provisions.
              </p>

              <h2 id="contact">10. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at{" "}
                <a href="mailto:support@tradeokev.com">support@tradeokev.com</a>.
              </p>

              <p className="mt-10 text-sm text-futuristic-muted-foreground/80">
                <em>
                  Please note: This document is a template provided for informational purposes. It is not a substitute
                  for professional legal advice. You should consult with a qualified legal professional to ensure these
                  Terms of Service are complete and appropriate for your specific business needs and comply with all
                  applicable laws and regulations.
                </em>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
