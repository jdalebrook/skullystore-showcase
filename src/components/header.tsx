import Link from "next/link";
import Image from "next/image";
import { ShieldIcon } from "@/components/icons/shield-icon";
import { UserIcon } from "@/components/icons/user-icon";
import { getTopLevelCategories } from "@/lib/catalog";
import { CategoryNav } from "@/components/category-nav";
import { MobileNav } from "@/components/mobile-nav";
import { CartDrawer } from "@/components/cart-drawer";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { siteConfig } from "@/lib/site-config";

export async function Header() {
  const [categories, session] = await Promise.all([
    getTopLevelCategories(),
    auth(),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-6">
        <MobileNav categories={categories} />
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-heading text-lg font-semibold tracking-tight"
        >
          <Image
            src={siteConfig.logoPath}
            alt=""
            width={32}
            height={32}
            className="size-8 object-contain"
          />
          {siteConfig.name}
        </Link>
        <CategoryNav categories={categories} />
        <div className="ml-auto flex items-center gap-1">
          {session?.user?.role === "ADMIN" && (
            <Button
              variant="ghost"
              size="icon"
              nativeButton={false}
              aria-label="Panel de administración"
              render={<Link href="/admin" />}
            >
              <ShieldIcon />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            aria-label={session?.user ? "Mi cuenta" : "Entrar"}
            render={<Link href={session?.user ? "/cuenta" : "/login"} />}
          >
            <UserIcon />
          </Button>
          <CartDrawer />
        </div>
      </div>
    </header>
  );
}
