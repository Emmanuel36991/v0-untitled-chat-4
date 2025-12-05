import type { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck, UserCircle, Database, ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy - TradeOkev",
  description: "Read the Privacy Policy for TradeOkev to understand how we handle your data.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/marketing" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketing Page
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 sm:p-10">
          <div className="flex items-center mb-6">
            <ShieldCheck className="w-10 h-10 text-primary mr-4" />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Privacy Policy</h1>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Last Updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
            <p>
              TradeOkev ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how
              we collect, use, disclose, and safeguard your information when you use our application, website, and
              services (collectively, the "Service"). Please read this policy carefully.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">
              <UserCircle className="inline-block w-6 h-6 mr-2 align-middle" />
              Information We Collect
            </h2>
            <p>
              We may collect personal information that you voluntarily provide to us when you register for an account,
              use the Service, or communicate with us. This information may include your name, email address, trading
              preferences, and any trade data you input into the Service.
            </p>
            <p>
              We may also collect non-personal information automatically as you navigate through the Service, such as
              usage details, IP addresses, and information collected through cookies and other tracking technologies.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">
              <Database className="inline-block w-6 h-6 mr-2 align-middle" />
              How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6">
              <li>Provide, operate, and maintain our Service;</li>
              <li>Improve, personalize, and expand our Service;</li>
              <li>Understand and analyze how you use our Service;</li>
              <li>Develop new products, services, features, and functionality;</li>
              <li>
                Communicate with you, either directly or through one of our partners, including for customer service, to
                provide you with updates and other information relating to the Service, and for marketing and
                promotional purposes (with your consent, where required);
              </li>
              <li>Process your transactions and manage your account;</li>
              <li>Find and prevent fraud.</li>
            </ul>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">Data Security</h2>
            <p>
              We implement a variety of security measures to maintain the safety of your personal information. However,
              no electronic storage or transmission over the Internet is 100% secure. While we strive to use
              commercially acceptable means to protect your personal information, we cannot guarantee its absolute
              security.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">Third-Party Services</h2>
            <p>
              We may employ third-party companies and individuals to facilitate our Service ("Service Providers"), to
              provide the Service on our behalf, to perform Service-related services, or to assist us in analyzing how
              our Service is used. These third parties have access to your Personal Information only to perform these
              tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">Your Data Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, such as the
              right to access, correct, delete, or restrict its use. Please contact us to exercise these rights.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy
              Policy periodically for any changes.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at [Your Contact Email or Link to
              Contact Form].
            </p>

            <p className="mt-10 text-sm text-gray-600 dark:text-gray-400">
              <em>
                Please note: This is a template and should be reviewed and customized by legal counsel to fit your
                specific business needs and comply with all applicable laws and regulations, such as GDPR, CCPA, etc.
              </em>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
