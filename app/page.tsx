import Link from "next/link"
import {
  BarChart3,
  Brain,
  Calculator,
  TrendingUp,
  Check,
  ArrowRight,
  Play,
  FileText,
  AlertTriangle,
  RotateCcw,
  Shield,
  Award,
  Minus,
  X,
} from "lucide-react"
import { ConcentradeLogo } from "@/components/concentrade-logo"
import { Button } from "@/components/ui/button"
import { MarketingNav } from "@/components/marketing/marketing-nav"

export default function HomePage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <MarketingNav />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center relative overflow-hidden">
        {/* Background image with candles and market */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3")'
          }}
        ></div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-sm font-medium text-indigo-300">
              <ConcentradeLogo size={16} variant="icon" />
              Join 15,000+ profitable traders
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Turn Your Trading{" "}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Chaos
            </span>
            <br />
            Into Consistent{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Profits
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            The only trading journal that combines professional analytics with emotional intelligence to eliminate
            costly mistakes and build winning strategies.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg px-8 py-6 shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-200 hover:scale-105"
            >
              <Link href="/signup">
                <TrendingUp className="h-5 w-5 mr-2" />
                Start Free 14-Day Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-lg px-8 py-6"
            >
              <Link href="/demo">
                <Play className="h-5 w-5 mr-2" />
                Watch Live Demo
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
              <div className="text-3xl font-bold text-indigo-400 mb-2">15,000+</div>
              <div className="text-sm text-slate-400">Active Traders</div>
            </div>
            <div className="text-center p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
              <div className="text-3xl font-bold text-indigo-400 mb-2">+127%</div>
              <div className="text-sm text-slate-400">Avg Profit Improvement</div>
            </div>
            <div className="text-center p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center">
              <Shield className="h-6 w-6 text-indigo-400 mb-2" />
              <div className="text-xs text-slate-400">SSL Secured</div>
            </div>
            <div className="text-center p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center">
              <Award className="h-6 w-6 text-indigo-400 mb-2" />
              <div className="text-xs text-slate-400">SOC 2 Compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Are You Tired of{" "}
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                Losing Money
              </span>{" "}
              to the Same Mistakes?
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              95% of retail traders fail because they can't identify patterns in their losses. Sound familiar?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-indigo-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">Scattered Records</h3>
              <p className="text-slate-300 mb-6 text-center">
                Trading notes across multiple spreadsheets, apps, and sticky notes make it impossible to spot
                profitable patterns.
              </p>
              <div className="text-red-500 font-bold text-lg text-center">Average Loss: -$2,847/month</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-indigo-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">Emotional Decisions</h3>
              <p className="text-slate-300 mb-6 text-center">
                Fear and greed drive your trades instead of data, leading to revenge trading and blown accounts.
              </p>
              <div className="text-red-500 font-bold text-lg text-center">Emotional Cost: -$4,231/month</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-indigo-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <RotateCcw className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">Repeated Mistakes</h3>
              <p className="text-slate-300 mb-6 text-center">
                Without proper analysis, you keep making the same costly errors that drain your account.
              </p>
              <div className="text-red-500 font-bold text-lg text-center">Repeat Losses: -$3,156/month</div>
            </div>
          </div>

          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-8">Which Challenge Hits Closest to Home?</h3>
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <Button
                asChild
                variant="outline"
                className="h-auto py-6 px-6 flex flex-col items-center gap-2 border-slate-700 hover:border-indigo-500 hover:bg-slate-800 transition-all"
              >
                <Link href="/signup">
                  <div className="font-semibold text-base">Poor Record-Keeping</div>
                  <div className="text-sm text-slate-400">Can't track what's working</div>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto py-6 px-6 flex flex-col items-center gap-2 border-slate-700 hover:border-indigo-500 hover:bg-slate-800 transition-all"
              >
                <Link href="/signup">
                  <div className="font-semibold text-base">Emotional Trading</div>
                  <div className="text-sm text-slate-400">FOMO and revenge trades</div>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto py-6 px-6 flex flex-col items-center gap-2 border-slate-700 hover:border-indigo-500 hover:bg-slate-800 transition-all"
              >
                <Link href="/signup">
                  <div className="font-semibold text-base">Tax Complications</div>
                  <div className="text-sm text-slate-400">Nightmare at tax time</div>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Professional-grade tools that transform scattered data into actionable insights.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-indigo-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Advanced Analytics</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Discover hidden patterns in your trading with AI-powered analysis that identifies your most profitable
                setups and costly mistakes.
              </p>
              <div className="bg-slate-900/50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Win Rate Trend</span>
                  <span className="text-indigo-400 font-semibold">+12% this month</span>
                </div>
                <div className="flex gap-1">
                  {[40, 60, 45, 70, 85, 75, 90].map((height, i) => (
                    <div
                      key={i}
                      className="bg-indigo-500/70 rounded-sm flex-1"
                      style={{ height: `${height / 2}px` }}
                    />
                  ))}
                </div>
              </div>
              <Link href="#" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Explore Analytics →
              </Link>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-indigo-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Emotional Intelligence</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Track your emotional state during trades and discover how fear, greed, and confidence impact your
                performance.
              </p>
              <div className="bg-slate-900/50 p-4 rounded-lg mb-4">
                <div className="mb-3">
                  <span className="text-sm font-medium">Today's Emotional State</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Confident</span>
                    <div className="w-24 h-2 bg-slate-700 rounded-full">
                      <div className="w-4/5 h-full bg-indigo-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fearful</span>
                    <div className="w-24 h-2 bg-slate-700 rounded-full">
                      <div className="w-1/4 h-full bg-yellow-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              <Link href="#" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Learn More →
              </Link>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-indigo-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Calculator className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Automated Tax Reporting</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Generate IRS-compliant reports instantly. No more spreadsheet nightmares at tax time.
              </p>
              <div className="bg-slate-900/50 p-4 rounded-lg mb-4">
                <div className="mb-3">
                  <span className="text-sm font-medium">2025 Tax Summary</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Short-term gains:</span>
                    <span className="text-indigo-400">$12,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Long-term gains:</span>
                    <span className="text-indigo-400">$8,230</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wash sales:</span>
                    <span className="text-red-500">-$1,200</span>
                  </div>
                </div>
              </div>
              <Link href="#" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                View Tax Features →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-slate-900/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Real Traders, Real Results</h2>
            <p className="text-xl text-slate-300">See how Concentrade transformed their trading</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
              <p className="text-lg text-slate-200 mb-6 leading-relaxed">
                "Concentrade helped me identify my emotional trading patterns. I've reduced my losses by 60% and my
                win rate improved from 45% to 72%. Best $29/month I've ever spent."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                  MC
                </div>
                <div>
                  <div className="font-semibold">Mike Chen</div>
                  <div className="text-sm text-slate-400">Day Trader, 3 years</div>
                  <div className="text-sm text-indigo-400">+$18,500 this quarter</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
              <p className="text-lg text-slate-200 mb-6 leading-relaxed">
                "The analytics are incredible. I discovered I was overtrading on Fridays and losing money
                consistently. Fixed that one issue and gained $15K this quarter."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                  SR
                </div>
                <div>
                  <div className="font-semibold">Sarah Rodriguez</div>
                  <div className="text-sm text-slate-400">Swing Trader, 5 years</div>
                  <div className="text-sm text-indigo-400">+$15,000 this quarter</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
              <p className="text-lg text-slate-200 mb-6 leading-relaxed">
                "Tax season used to be a nightmare. Now I generate my reports in seconds. The automated wash sale
                detection saved me thousands in penalties."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                  DJ
                </div>
                <div>
                  <div className="font-semibold">David Johnson</div>
                  <div className="text-sm text-slate-400">Options Trader, 7 years</div>
                  <div className="text-sm text-indigo-400">Saved $3,200 in taxes</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
              <p className="text-lg text-slate-200 mb-6 leading-relaxed">
                "I was bleeding money for months until I started using Concentrade. The emotional tracking showed me I
                was revenge trading after losses. Now I'm profitable 3 months straight."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                  AL
                </div>
                <div>
                  <div className="font-semibold">Alex Liu</div>
                  <div className="text-sm text-slate-400">Forex Trader, 2 years</div>
                  <div className="text-sm text-indigo-400">+$22,800 in 3 months</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
              <p className="text-lg text-slate-200 mb-6 leading-relaxed">
                "The ROI tracking is game-changing. I can see exactly which strategies work and which don't. My Sharpe
                ratio improved from 0.8 to 2.1 in just 4 months."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                  JM
                </div>
                <div>
                  <div className="font-semibold">Jessica Martinez</div>
                  <div className="text-sm text-slate-400">Crypto Trader, 4 years</div>
                  <div className="text-sm text-indigo-400">163% Sharpe improvement</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">See Concentrade in Action</h2>
            <p className="text-xl text-slate-300">Experience the full platform before you sign up</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-12 border border-indigo-500/20 shadow-2xl text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Play className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Try the Full Platform</h3>
              <p className="text-lg text-slate-300 mb-8">
                Explore a complete replica of Concentrade with real features and sample data. No signup required.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg px-8 py-6 shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-200 hover:scale-105"
              >
                <Link href="/demo">
                  <Play className="h-6 w-6 mr-2" />
                  Launch Interactive Demo
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <p className="text-sm text-slate-400 mt-4">Full access • No credit card • No signup required</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-slate-900/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-xl text-slate-300">Start free, upgrade when you're ready</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-2">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <span>Up to 50 trades/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <span>Basic analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <span>Trade journal</span>
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full border-slate-700 hover:bg-slate-700">
                <Link href="/signup">Get Started Free</Link>
              </Button>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-indigo-500 rounded-xl p-8 relative transform scale-105 shadow-2xl shadow-indigo-500/20">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <span>Unlimited trades</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <span>Emotional intelligence</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <span>Tax reporting</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button
                asChild
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Link href="/signup">Start Free Trial</Link>
              </Button>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <span>Everything in Professional</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <span>Team collaboration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <span>Dedicated support</span>
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full border-slate-700 hover:bg-slate-700">
                <Link href="/signup">Contact Sales</Link>
              </Button>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mt-16">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">Concentrade vs. Spreadsheets</h3>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-4 font-semibold">Feature</th>
                      <th className="text-center p-4 font-semibold">Spreadsheets</th>
                      <th className="text-center p-4 font-semibold text-indigo-400">Concentrade</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-medium">Setup Time</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-red-500">
                          <Minus className="h-5 w-5" />
                          <span>Hours</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-indigo-400 font-semibold">
                          <Check className="h-5 w-5" />
                          <span>2 minutes</span>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-medium">Pattern Recognition</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-red-500">
                          <Minus className="h-5 w-5" />
                          <span>Manual</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-indigo-400 font-semibold">
                          <Check className="h-5 w-5" />
                          <span>AI-Powered</span>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-medium">Emotional Tracking</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-red-500">
                          <X className="h-5 w-5" />
                          <span>None</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-indigo-400 font-semibold">
                          <Check className="h-5 w-5" />
                          <span>Advanced</span>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-medium">Tax Reports</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-red-500">
                          <Minus className="h-5 w-5" />
                          <span>Manual</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-indigo-400 font-semibold">
                          <Check className="h-5 w-5" />
                          <span>Automated</span>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-medium">Mobile Access</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-red-500">
                          <Minus className="h-5 w-5" />
                          <span>Limited</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-indigo-400 font-semibold">
                          <Check className="h-5 w-5" />
                          <span>Full App</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Transform Your Trading?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of traders who've eliminated costly mistakes and built consistent profits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg px-8 py-6 shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-200 hover:scale-105"
            >
              <Link href="/signup">
                <TrendingUp className="h-6 w-6 mr-2" />
                Start Your Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
          <p className="text-sm text-slate-400 mt-4">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900/80 py-12 px-4 border-t border-slate-800">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ConcentradeLogo size={24} variant="icon" />
                <span className="text-lg font-bold">Concentrade</span>
              </div>
              <p className="text-slate-400 text-sm">
                Transform your trading chaos into consistent profits with professional analytics and emotional
                intelligence.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="#features" className="hover:text-indigo-400 transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-indigo-400 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#demo" className="hover:text-indigo-400 transition-colors">
                    Demo
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-indigo-400 transition-colors">
                    Free Trial
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/privacy" className="hover:text-indigo-400 transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-indigo-400 transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">
                    API Docs
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2025 Concentrade. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
