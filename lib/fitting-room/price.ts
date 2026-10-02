/**
 * The Fitting Room's price (owner): the first try-ons are free, then each
 * costume tried on costs the same. Shown through the locale's currency
 * formatter, never as a written "$5".
 */
export const fittingRoomPrice = {
  freeTryOns: 2,
  perCostume: 5,
  currency: "USD",
} as const
