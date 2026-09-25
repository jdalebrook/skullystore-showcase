"use client";

import Link from "next/link";
import { MenuIcon } from "@/components/icons/menu-icon";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type Category = {
  slug: string;
  name: string;
};

export function MobileNav({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Abrir menú" className="md:hidden" />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Categorías</SheetTitle>
        </SheetHeader>
        <nav aria-label="Categorías" className="px-4">
          <ul className="flex flex-col gap-1">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/categoria/${category.slug}`}
                  className="block rounded-md px-2 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
