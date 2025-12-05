import { ConcentradeLogo, ConcentradeLogoMinimal } from "./concentrade-logo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function LogoShowcase() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Concentrade Logo Variations</h2>
        <p className="text-muted-foreground mb-8">
          Professional logo designs for the trading journal and analytics platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Full Logo - Large */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Full Logo - Large</CardTitle>
            <CardDescription>Primary logo for headers and branding</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8 bg-muted/20">
            <ConcentradeLogo size={80} variant="full" />
          </CardContent>
        </Card>

        {/* Full Logo - Medium */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Full Logo - Medium</CardTitle>
            <CardDescription>Standard size for navigation</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8 bg-muted/20">
            <ConcentradeLogo size={60} variant="full" />
          </CardContent>
        </Card>

        {/* Icon Only */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Icon Only</CardTitle>
            <CardDescription>For favicons and compact spaces</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8 bg-muted/20">
            <ConcentradeLogo size={48} variant="icon" />
          </CardContent>
        </Card>

        {/* Text Only */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Text Only</CardTitle>
            <CardDescription>Typography-focused variant</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8 bg-muted/20">
            <ConcentradeLogo size={40} variant="text" />
          </CardContent>
        </Card>

        {/* Minimal Version */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Minimal Icon</CardTitle>
            <CardDescription>Simplified for small sizes</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8 bg-muted/20">
            <ConcentradeLogoMinimal size={48} />
          </CardContent>
        </Card>

        {/* Small Sizes Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Size Variations</CardTitle>
            <CardDescription>Scalability demonstration</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center gap-4 py-8 bg-muted/20">
            <ConcentradeLogo size={24} variant="full" />
            <ConcentradeLogo size={32} variant="full" />
            <ConcentradeLogo size={40} variant="full" />
          </CardContent>
        </Card>
      </div>

      {/* Usage Examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Usage Examples</h3>

        {/* Header Example */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Navigation Header</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
              <ConcentradeLogo size={40} variant="full" />
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Dashboard</span>
                <span>Trades</span>
                <span>Analytics</span>
                <span>AI Coach</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Example */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mobile Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-background max-w-sm">
              <ConcentradeLogoMinimal size={32} />
              <div className="text-sm font-medium">Menu</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
