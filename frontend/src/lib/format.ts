export function formatPrice(price: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatArea(sqft: number): string {
  return `${new Intl.NumberFormat("en-US").format(sqft)} sqft`;
}

export const propertyStatusLabels: Record<string, string> = {
  ForSale: "For Sale",
  ForRent: "For Rent",
  UnderOffer: "Under Offer",
  Sold: "Sold",
  OffMarket: "Off-Market",
};
