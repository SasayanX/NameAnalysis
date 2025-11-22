"use client"

const DEFAULT_BASIC_PRODUCT_ID = "basic_monthly"
const DEFAULT_PREMIUM_PRODUCT_ID = "premium_monthly"
const DEFAULT_DRAGON_BREATH_PRODUCT_ID = "dragon_breath"

export const GOOGLE_PLAY_PRODUCT_IDS = {
  basic: process.env.NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_BASIC ?? DEFAULT_BASIC_PRODUCT_ID,
  premium: process.env.NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_PREMIUM ?? DEFAULT_PREMIUM_PRODUCT_ID,
  dragonBreath: process.env.NEXT_PUBLIC_GOOGLE_PLAY_PRODUCT_ID_DRAGON_BREATH ?? DEFAULT_DRAGON_BREATH_PRODUCT_ID,
} as const

export type GooglePlayProductKey = keyof typeof GOOGLE_PLAY_PRODUCT_IDS

export function getGooglePlayProductId(plan: GooglePlayProductKey): string {
  return GOOGLE_PLAY_PRODUCT_IDS[plan]
}

