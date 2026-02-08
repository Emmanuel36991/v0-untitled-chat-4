import type { Metadata } from "next"
import { LegalLayout } from "@/components/layout/legal-layout"
import { Mail, MapPin, Building2, Clock, Shield, Phone } from "lucide-react"

export const metadata: Metadata = {
    title: "Contact Us - Concentrade",
    description: "Get in touch with Concentrade. Contact information, corporate details, and response times.",
}

export default function ContactPage() {
    return (
        <LegalLayout title="Contact Us">
            {/* Introduction */}
            <section id="introduction">
                <p className="lead text-lg text-slate-700 leading-relaxed">
                    We're here to help! Whether you have a question, need support, or want to provide feedback, you can
                    reach us through the contact methods below.
                </p>
            </section>

            {/* Contact Methods */}
            <section id="contact-methods" className="mt-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Methods</h2>
                <div className="grid gap-6 md:grid-cols-2">
                    {/* General Inquiries */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Mail className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">General Inquiries</h3>
                                <p className="text-sm text-slate-600 mb-3">
                                    For general questions, partnerships, or feedback
                                </p>
                                <a
                                    href="mailto:contact@concentrade.com"
                                    className="text-purple-600 hover:underline font-medium"
                                >
                                    contact@concentrade.com
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Support */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Mail className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Customer Support</h3>
                                <p className="text-sm text-slate-600 mb-3">
                                    Technical issues, billing questions, or account help
                                </p>
                                <a
                                    href="mailto:support@concentrade.com"
                                    className="text-purple-600 hover:underline font-medium"
                                >
                                    support@concentrade.com
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Data Privacy */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <Shield className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Data Protection Officer</h3>
                                <p className="text-sm text-slate-600 mb-3">
                                    Privacy concerns, data requests, or GDPR/Israeli PPL inquiries
                                </p>
                                <a
                                    href="mailto:privacy@concentrade.com"
                                    className="text-purple-600 hover:underline font-medium"
                                >
                                    privacy@concentrade.com
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Legal */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-slate-700" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Legal & Compliance</h3>
                                <p className="text-sm text-slate-600 mb-3">Legal notices, compliance matters, or disputes</p>
                                <a href="mailto:legal@concentrade.com" className="text-purple-600 hover:underline font-medium">
                                    legal@concentrade.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Response Times */}
            <section id="response-times" className="mt-12">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-6">
                    <Clock className="w-6 h-6 text-purple-600" />
                    Expected Response Times
                </h2>
                <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-r-lg space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-700 font-medium">General Inquiries</span>
                        <span className="text-purple-700 font-semibold">24-48 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-700 font-medium">Customer Support</span>
                        <span className="text-purple-700 font-semibold">12-24 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-700 font-medium">Data Privacy Requests (GDPR/PPL)</span>
                        <span className="text-purple-700 font-semibold">Within 30 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-700 font-medium">Legal Matters</span>
                        <span className="text-purple-700 font-semibold">3-5 business days</span>
                    </div>
                </div>
                <p className="text-sm text-slate-600 mt-4">
                    <strong>Note:</strong> Response times may vary during weekends and Israeli public holidays. We
                    appreciate your patience.
                </p>
            </section>

            {/* Corporate Details */}
            <section id="corporate-details" className="mt-12">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-6">
                    <Building2 className="w-6 h-6 text-purple-600" />
                    Corporate Details
                </h2>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Company Name</h3>
                        <p className="text-slate-900 font-medium">Concentrade Ltd.</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Registered Address
                        </h3>
                        <div className="flex items-start gap-2 text-slate-700">
                            <MapPin className="w-4 h-4 mt-1 text-slate-500 flex-shrink-0" />
                            <div>
                                <p>[Company Registered Address]</p>
                                <p>[City], [Postal Code]</p>
                                <p>Israel</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            <em>To be updated by legal counsel with official registered business address</em>
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Business Registration Number
                        </h3>
                        <p className="text-slate-700">[Company Registration Number]</p>
                        <p className="text-xs text-slate-500 mt-1">
                            <em>Israeli company registration number (מספר חברה) to be provided</em>
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            VAT Number (if applicable)
                        </h3>
                        <p className="text-slate-700">[VAT Registration Number]</p>
                        <p className="text-xs text-slate-500 mt-1">
                            <em>Required if company is registered for VAT in Israel or EU</em>
                        </p>
                    </div>
                </div>

                <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <p className="text-sm text-yellow-900">
                        <strong>⚠️ Action Required:</strong> The corporate details section contains placeholder information
                        that must be updated with your actual registered business information to comply with Israeli
                        disclosure laws. Please consult with your legal counsel.
                    </p>
                </div>
            </section>

            {/* Office Hours */}
            <section id="office-hours" className="mt-12">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-6">
                    <Clock className="w-6 h-6 text-purple-600" />
                    Support Availability
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Email Support</h3>
                        <p className="text-slate-700">Available 24/7</p>
                        <p className="text-sm text-slate-600 mt-1">We monitor emails continuously and respond promptly</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Live Chat (Coming Soon)</h3>
                        <p className="text-slate-700">Sunday - Thursday, 9:00 - 18:00 IST</p>
                        <p className="text-sm text-slate-600 mt-1">Real-time support during business hours</p>
                    </div>
                </div>
            </section>

            {/* Alternative Contact */}
            <section id="other-ways" className="mt-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Other Ways to Get Help</h2>
                <div className="space-y-4">
                    <a
                        href="/support"
                        className="block bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-6 hover:shadow-md transition-all"
                    >
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Visit Our Support Center</h3>
                        <p className="text-slate-700">
                            Browse our FAQ, search for answers, or submit a support ticket directly through our Support Center.
                        </p>
                    </a>

                    <a
                        href="/privacy#your-rights"
                        className="block bg-slate-50 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all"
                    >
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Data Privacy Requests</h3>
                        <p className="text-slate-700">
                            To request access, deletion, or export of your personal data, visit our Privacy Policy for detailed
                            instructions or email privacy@concentrade.com.
                        </p>
                    </a>
                </div>
            </section>
        </LegalLayout>
    )
}
