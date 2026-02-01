export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  interval: 'month' | 'year' | 'one_time'
  features: string[]
  popular?: boolean
}

// This is the source of truth for all subscription products.
// All UI to display products should pull from this array.
// IDs passed to the checkout session should be the same as IDs from this array.
export const PRODUCTS: Product[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Essential tools to start your trading journey',
    priceInCents: 0,
    interval: 'month',
    features: [
      'Basic trade logging',
      'Up to 50 trades per month',
      'Basic performance metrics',
      'Daily journal entries',
      'Community access',
    ],
  },
  {
    id: 'pro-monthly',
    name: 'Pro',
    description: 'Advanced features for serious traders',
    priceInCents: 2900, // $29.00
    interval: 'month',
    popular: true,
    features: [
      'Unlimited trade logging',
      'AI-powered trade insights',
      'Advanced psychology analytics',
      'Unlimited backtesting',
      'Custom trading playbooks',
      'Priority support',
      'Export reports (CSV, PDF)',
      'Advanced chart annotations',
    ],
  },
  {
    id: 'pro-yearly',
    name: 'Pro (Annual)',
    description: 'Best value - Save 20% with annual billing',
    priceInCents: 27800, // $278.00 ($23.17/month)
    interval: 'year',
    features: [
      'Unlimited trade logging',
      'AI-powered trade insights',
      'Advanced psychology analytics',
      'Unlimited backtesting',
      'Custom trading playbooks',
      'Priority support',
      'Export reports (CSV, PDF)',
      'Advanced chart annotations',
      '2 months free',
    ],
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}

export function isPaidProduct(id: string): boolean {
  const product = getProductById(id)
  return product ? product.priceInCents > 0 : false
}
