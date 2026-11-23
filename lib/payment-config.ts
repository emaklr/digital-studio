import { services } from "@/lib/services";

// Provisional deposit policy. Keep checkout disabled until these percentages and the FX rate
// have been reviewed and explicitly approved for launch.
export const depositPercentByService: Record<string, number> = {
  websites: 50,
  ecommerce: 60,
  "web-applications": 40,
  automation: 70,
  "ai-solutions": 60,
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
