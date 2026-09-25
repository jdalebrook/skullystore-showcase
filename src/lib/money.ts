import { siteConfig } from "@/lib/site-config";

const formatter = new Intl.NumberFormat(siteConfig.locale, {
  style: "currency",
  currency: siteConfig.currency,
});

export function formatCents(cents: number): string {
  return formatter.format(cents / 100);
}
