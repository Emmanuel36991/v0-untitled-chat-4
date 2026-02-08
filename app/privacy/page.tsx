import type { Metadata } from "next"
import { LegalLayout } from "@/components/layout/legal-layout"
import { Database, Shield, Cookie, Download, Trash2, Lock } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy - Concentrade",
  description: "Read Concentrade's Privacy Policy to understand how we collect, use, and protect your trading data.",
}

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <LegalLayout title="Privacy Policy" lastUpdated={lastUpdated}>
      {/* Introduction */}
      <section id="introduction">
        <p className="lead text-lg text-slate-700 leading-relaxed">
          Concentrade ("we," "us," or "our") is committed to protecting your privacy and ensuring the
          security of your personal and trading data. This Privacy Policy explains how we collect, use,
          disclose, and safeguard your information when you use our trading journal application and services
          (the "Service").
        </p>
        <p className="text-slate-700 leading-relaxed">
          This policy complies with the Israeli Protection of Privacy Law, 5741-1981 (PPL), the General Data
          Protection Regulation (GDPR), and other applicable data protection laws.
        </p>
      </section>

      {/* Database Owner Declaration */}
      <section id="database-owner" className="mt-12">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-4">
          <Database className="w-6 h-6 text-purple-600" />
          Database Owner Declaration
        </h2>
        <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-r-lg">
          <p className="text-slate-800 font-medium mb-3">
            <strong>Concentrade is the owner of the database</strong> containing all user information and
            trading data as defined under the Israeli Protection of Privacy Law.
          </p>
          <p className="text-slate-700 leading-relaxed">
            We collect and process the following categories of data:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-2 text-slate-700">
            <li>
              <strong>Trade Data:</strong> Instrument names, entry/exit prices, position sizes, stop-loss and
              take-profit levels, profit/loss (P&L), trade timestamps, trade screenshots
            </li>
            <li>
              <strong>Emotional & Psychological Data:</strong> Pre-trade emotional state, post-trade
              reflections, notes, tags, custom journal entries
            </li>
            <li>
              <strong>Account Information:</strong> Email address, name (if provided), authentication tokens,
              user ID
            </li>
            <li>
              <strong>Usage Data:</strong> Feature interactions, session duration, browser type, IP address
              (anonymized), device information
            </li>
            <li>
              <strong>Financial Summary Data:</strong> Aggregate P&L statistics, win rate, average
              risk-reward ratio (derived from trade data)
            </li>
          </ul>
        </div>
      </section>

      {/* How We Collect Information */}
      <section id="collection" className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">How We Collect Information</h2>
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Information You Provide Directly</h3>
            <p>
              You voluntarily provide information when you create an account, manually input trades, connect
              broker integrations (e.g., Tradovate), upload screenshots, or communicate with our support team.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Automatically Collected Information</h3>
            <p>
              We automatically collect certain technical information through cookies, log files, and analytics
              tools to improve the Service and understand usage patterns.
            </p>
          </div>
        </div>
      </section>

      {/* Third-Party Processors */}
      <section id="third-parties" className="mt-12">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-4">
          <Lock className="w-6 h-6 text-purple-600" />
          Third-Party Service Providers
        </h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          We employ trusted third-party companies to facilitate our Service. These providers have access to
          your data only to perform specific tasks on our behalf and are contractually obligated to protect
          it.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-slate-300 rounded-lg overflow-hidden">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Service Provider</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Purpose</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Data Location</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Data Shared</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">Supabase</td>
                <td className="px-6 py-4 text-sm text-slate-700">Database hosting & authentication</td>
                <td className="px-6 py-4 text-sm text-slate-700">US / EU regions</td>
                <td className="px-6 py-4 text-sm text-slate-700">All user data, trade data</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">OpenAI / Groq</td>
                <td className="px-6 py-4 text-sm text-slate-700">AI-powered trade analysis</td>
                <td className="px-6 py-4 text-sm text-slate-700">US</td>
                <td className="px-6 py-4 text-sm text-slate-700">
                  <strong className="text-emerald-700">Anonymized trade data only</strong>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">Vercel</td>
                <td className="px-6 py-4 text-sm text-slate-700">Application hosting</td>
                <td className="px-6 py-4 text-sm text-slate-700">Global CDN</td>
                <td className="px-6 py-4 text-sm text-slate-700">Technical/usage logs only</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-lg">
          <p className="text-sm text-emerald-900 font-medium">
            <strong>Important:</strong> Before sending trade data to AI providers (OpenAI/Groq), we remove all
            personally identifiable information (PII) including your name, email, and user ID. Only trade
            metrics and journal notes are analyzed.
          </p>
        </div>
      </section>

      {/* Cookies */}
      <section id="cookies" className="mt-12">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-4">
          <Cookie className="w-6 h-6 text-purple-600" />
          Cookies and Tracking Technologies
        </h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          We use cookies and similar technologies to enhance your experience and analyze usage patterns.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-slate-300 rounded-lg overflow-hidden">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Cookie Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Purpose</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Required?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">Authentication Cookies</td>
                <td className="px-6 py-4 text-sm text-slate-700">
                  Keep you logged in and secure your session
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Strictly Necessary
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">Preference Cookies</td>
                <td className="px-6 py-4 text-sm text-slate-700">
                  Remember your settings (theme, timezone, language)
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Functional
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">Analytics Cookies</td>
                <td className="px-6 py-4 text-sm text-slate-700">
                  Help us understand how you use the Service (anonymized)
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Optional
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-600 mt-4">
          You can control cookie preferences through your browser settings or within your Concentrade account
          settings.
        </p>
      </section>

      {/* Your Rights */}
      <section id="your-rights" className="mt-12">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-4">
          <Shield className="w-6 h-6 text-purple-600" />
          Your Data Rights (GDPR & Israeli PPL)
        </h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          You have the following rights regarding your personal data:
        </p>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Right to Access</h3>
              <p className="text-slate-700 leading-relaxed">
                You can request a copy of all personal data we hold about you. Go to{" "}
                <strong>Settings → Privacy → Export My Data</strong> to download your data in JSON format.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Right to be Forgotten (Deletion)</h3>
              <p className="text-slate-700 leading-relaxed mb-2">
                You can request permanent deletion of your account and all associated data at any time:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>
                  Go to <strong>Settings → Account → Delete Account</strong>
                </li>
                <li>
                  Or email us at{" "}
                  <a href="mailto:privacy@concentrade.com" className="text-purple-600 hover:underline">
                    privacy@concentrade.com
                  </a>
                </li>
              </ul>
              <p className="text-sm text-slate-600 mt-2">
                <strong>Note:</strong> Deleted data enters a 30-day grace period, after which it is permanently
                removed from all systems including backups.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Right to Rectification</h3>
              <p className="text-slate-700 leading-relaxed">
                You can update or correct your personal information anytime in your account settings or by
                contacting us.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Right to Data Portability</h3>
              <p className="text-slate-700 leading-relaxed">
                Export your data in a machine-readable format (JSON) to transfer to another service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Retention */}
      <section id="retention" className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Retention</h2>
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <p>
            <strong>Active Accounts:</strong> We retain your data for as long as your account is active or as
            needed to provide the Service.
          </p>
          <p>
            <strong>Deleted Accounts:</strong> When you delete your account, your data enters a 30-day grace
            period during which you can restore it. After 30 days, all data is permanently deleted from our
            production databases and backups.
          </p>
          <p>
            <strong>Legal Obligations:</strong> We may retain certain information if required by law (e.g., tax
            records, fraud prevention) for up to 7 years.
          </p>
        </div>
      </section>

      {/* Data Security */}
      <section id="security" className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Security</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          We implement industry-standard security measures to protect your data:
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-700">
          <li>
            <strong>Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256)
          </li>
          <li>
            <strong>Authentication:</strong> Secure authentication via Supabase with optional 2FA
          </li>
          <li>
            <strong>Access Controls:</strong> Role-based access controls limit who can access your data
          </li>
          <li>
            <strong>Regular Audits:</strong> Periodic security audits and vulnerability assessments
          </li>
        </ul>
        <p className="text-sm text-slate-600 mt-4">
          While we strive to protect your data using commercially acceptable means, no method of transmission
          or electronic storage is 100% secure. We cannot guarantee absolute security.
        </p>
      </section>

      {/* Changes to Privacy Policy */}
      <section id="changes" className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Changes to This Privacy Policy</h2>
        <p className="text-slate-700 leading-relaxed">
          We may update this Privacy Policy from time to time to reflect changes in our practices or legal
          requirements. We will notify you of significant changes via email or a prominent notice on the
          Service. The "Last Updated" date at the top of this page indicates when the policy was last revised.
        </p>
      </section>

      {/* Contact */}
      <section id="contact" className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          If you have questions about this Privacy Policy or wish to exercise your data rights, please contact
          our Data Protection Officer:
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
          <p className="text-slate-800">
            <strong>Data Protection Officer</strong>
          </p>
          <p className="text-slate-700 mt-2">
            Email:{" "}
            <a href="mailto:privacy@concentrade.com" className="text-purple-600 hover:underline">
              privacy@concentrade.com
            </a>
          </p>
          <p className="text-slate-700 mt-1">
            General Support:{" "}
            <a href="mailto:support@concentrade.com" className="text-purple-600 hover:underline">
              support@concentrade.com
            </a>
          </p>
          <p className="text-sm text-slate-600 mt-4">
            We will respond to all data protection requests within 30 days as required by GDPR and Israeli PPL.
          </p>
        </div>
      </section>
    </LegalLayout>
  )
}
