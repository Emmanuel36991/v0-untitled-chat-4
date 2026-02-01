import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, ExternalLink } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Accessibility Statement - Concentrade",
  description: "Concentrade's commitment to digital accessibility and compliance with WCAG 2.1 AA and Israeli Standard 5568",
}

export default function AccessibilityStatementPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Accessibility Statement</CardTitle>
            <CardDescription>
              Last Updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Commitment */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Commitment</h2>
              <p className="text-muted-foreground leading-relaxed">
                Concentrade is committed to ensuring digital accessibility for people with disabilities. We continually
                improve the user experience for everyone and apply the relevant accessibility standards to ensure we
                provide equal access to all of our users.
              </p>
            </section>

            <Separator />

            {/* Standards Compliance */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Standards Compliance</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our website is designed to conform to the following accessibility standards:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>
                  <strong>WCAG 2.1 Level AA</strong> - Web Content Accessibility Guidelines, the international standard
                  for web accessibility
                </li>
                <li>
                  <strong>Israeli Standard 5568</strong> - Requirements for content accessibility on the internet for
                  people with disabilities
                </li>
              </ul>
            </section>

            <Separator />

            {/* Accessibility Features */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Accessibility Features</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We have implemented the following features to improve accessibility:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>
                  <strong>Accessibility Toolbar</strong> - A comprehensive control panel with text sizing, contrast
                  modes, and readability options
                </li>
                <li>
                  <strong>Keyboard Navigation</strong> - Full keyboard support for navigating and interacting with all
                  features
                </li>
                <li>
                  <strong>Screen Reader Compatibility</strong> - Semantic HTML and ARIA labels for assistive technology
                </li>
                <li>
                  <strong>High Contrast Mode</strong> - Yellow text on black background for maximum visibility
                </li>
                <li>
                  <strong>Grayscale & Color Inversion</strong> - Alternative color schemes for users with visual
                  impairments
                </li>
                <li>
                  <strong>Readable Fonts</strong> - System sans-serif fonts for enhanced readability
                </li>
                <li>
                  <strong>Link Highlighting</strong> - Prominent visual indicators for all interactive elements
                </li>
                <li>
                  <strong>Animation Controls</strong> - Option to disable animations and reduce motion
                </li>
                <li>
                  <strong>Heading Structure</strong> - Visual outline of page hierarchy for better navigation
                </li>
                <li>
                  <strong>RTL Support</strong> - Right-to-left layout support for Hebrew and other RTL languages
                </li>
              </ul>
            </section>

            <Separator />

            {/* Known Limitations */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Known Limitations</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                While we strive for full accessibility, we acknowledge the following areas where we are working to
                improve:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Some third-party chart libraries may have limited accessibility features</li>
                <li>Complex interactive visualizations may require additional assistive technology support</li>
                <li>PDF reports generated from the system are being enhanced for screen reader compatibility</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We are actively working to address these limitations in upcoming updates.
              </p>
            </section>

            <Separator />

            {/* Feedback & Contact */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Feedback & Contact</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We welcome your feedback on the accessibility of Concentrade. If you encounter any accessibility
                barriers or have suggestions for improvement, please contact us:
              </p>
              <div className="space-y-4 bg-muted/30 p-6 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <a
                      href="mailto:accessibility@concentrade.com"
                      className="text-primary hover:underline underline-offset-4"
                    >
                      accessibility@concentrade.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <a href="tel:+972-3-1234567" className="text-primary hover:underline underline-offset-4">
                      +972-3-123-4567
                    </a>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                We aim to respond to accessibility feedback within 3 business days.
              </p>
            </section>

            <Separator />

            {/* External Resources */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Additional Resources</h2>
              <div className="space-y-3">
                <a
                  href="https://www.w3.org/WAI/WCAG21/quickref/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline underline-offset-4"
                >
                  WCAG 2.1 Quick Reference Guide
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href="https://www.gov.il/en/departments/policies/accessibility"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline underline-offset-4"
                >
                  Israeli Standard 5568 Information
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href="https://www.w3.org/WAI/people-use-web/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline underline-offset-4"
                >
                  How People with Disabilities Use the Web
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
