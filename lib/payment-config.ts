import { services } from "@/lib/services";

// Approved fixed-package policy: 50% to begin, 50% before final handover.
// Custom projects are quoted separately and use an agreed milestone schedule.
export const depositPercentByService: Record<string, number> = {
  websites: 50,
  ecommerce: 50,
  "web-applications": 50,
  automation: 50,
  "ai-solutions": 50,
};

export function getUsdNgnRate() {
  const raw = process.env.USD_NGN_RATE;
  const rate = raw ? Number(raw) : NaN;
  return Number.isFinite(rate) && rate > 0 ? rate : null;
}

export function getPackage(serviceSlug: string, packageName: string) {
  const service = services.find((item) => item.slug === serviceSlug);
  const selectedPackage = service?.packages.find((item) => item.name === packageName);
  if (!service || !selectedPackage) return null;
  return { service, selectedPackage };
}

export function calculateDeposit(priceUsd: number, percent: number, usdNgnRate: number) {
  const depositUsd = Math.ceil((priceUsd * percent) / 100);
  const amountNgnKobo = Math.round(depositUsd * usdNgnRate * 100);
  return { depositUsd, amountNgnKobo };
}
