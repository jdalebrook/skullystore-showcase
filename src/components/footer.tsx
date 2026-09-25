import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { CookiePreferencesButton } from "@/components/cookie-preferences-button";

const legalLinks = [
  { href: "/aviso-legal", label: "Aviso legal" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/cookies", label: "Cookies" },
  { href: "/terminos", label: "Términos y condiciones" },
];

const analyticsConfigured = !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. Todos los derechos
          reservados.
        </p>
        <nav aria-label="Legal">
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground/70">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-muted-foreground hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
            {analyticsConfigured && (
              <li>
                <CookiePreferencesButton />
              </li>
            )}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
