export const PLANS = {
  free: {
    chatsPerMonth: 20,
    downloadsPerMonth: 5,
    label: "Free",
  },
  pro: {
    chatsPerMonth: Infinity,
    downloadsPerMonth: Infinity,
    label: "Pro",
  },
} as const

export type Plan = keyof typeof PLANS