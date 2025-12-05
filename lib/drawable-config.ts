export interface DrawableAsset {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
}

export interface DrawableConfig {
  logo: DrawableAsset
  logoLight?: DrawableAsset
  logoDark?: DrawableAsset
  stepIcons: {
    methodology: DrawableAsset
    markets: DrawableAsset
    instruments: DrawableAsset
    preferences: DrawableAsset
    final: DrawableAsset
  }
  backgrounds?: {
    hero?: DrawableAsset
    setup?: DrawableAsset
  }
  instrumentIcons?: {
    [key: string]: DrawableAsset
  }
}

export const DEFAULT_DRAWABLE_CONFIG: DrawableConfig = {
  logo: {
    src: "/images/trade-okev-logo.png",
    alt: "Trade Okev Logo",
    width: 40,
    height: 40,
    priority: true,
  },
  logoLight: {
    src: "/images/trade-okev-logo-light.png",
    alt: "Trade Okev Logo Light",
    width: 40,
    height: 40,
    priority: true,
  },
  logoDark: {
    src: "/images/trade-okev-logo-dark.png",
    alt: "Trade Okev Logo Dark",
    width: 40,
    height: 40,
    priority: true,
  },
  stepIcons: {
    methodology: {
      src: "/images/icons/brain-icon.png",
      alt: "Trading Methodologies",
      width: 24,
      height: 24,
    },
    markets: {
      src: "/images/icons/chart-icon.png",
      alt: "Trading Markets",
      width: 24,
      height: 24,
    },
    instruments: {
      src: "/images/icons/trending-icon.png",
      alt: "Specific Instruments",
      width: 24,
      height: 24,
    },
    preferences: {
      src: "/images/icons/palette-icon.png",
      alt: "Interface Preferences",
      width: 24,
      height: 24,
    },
    final: {
      src: "/images/icons/settings-icon.png",
      alt: "Final Configuration",
      width: 24,
      height: 24,
    },
  },
  backgrounds: {
    hero: {
      src: "/images/backgrounds/hero-bg.jpg",
      alt: "Hero Background",
      width: 1920,
      height: 1080,
    },
    setup: {
      src: "/images/backgrounds/setup-bg.jpg",
      alt: "Setup Background",
      width: 1920,
      height: 1080,
    },
  },
  instrumentIcons: {
    us_flag: {
      src: "/images/instruments/us-flag.png",
      alt: "US Flag",
      width: 32,
      height: 32,
    },
    dollar_sign: {
      src: "/images/instruments/dollar-sign.png",
      alt: "Dollar Sign",
      width: 32,
      height: 32,
    },
    oil_drop: {
      src: "/images/instruments/oil-drop.png",
      alt: "Oil Drop",
      width: 32,
      height: 32,
    },
  },
}

// Asset validation and loading utilities
export function validateAsset(asset: DrawableAsset): boolean {
  return !!(asset.src && asset.alt && asset.width && asset.height)
}

export function getAssetUrl(asset: DrawableAsset): string {
  return asset.src || "/placeholder.svg"
}

// Preload critical assets
export function preloadCriticalAssets(config: DrawableConfig): void {
  const criticalAssets = [config.logo, config.logoLight, config.logoDark, ...Object.values(config.stepIcons)].filter(
    (asset): asset is DrawableAsset => asset !== undefined,
  )

  criticalAssets.forEach((asset) => {
    if (validateAsset(asset)) {
      const link = document.createElement("link")
      link.rel = "preload"
      link.as = "image"
      link.href = getAssetUrl(asset)
      document.head.appendChild(link)
    }
  })
}
