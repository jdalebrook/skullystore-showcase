import Link from "next/link";

type Category = {
  slug: string;
  name: string;
};

export function CategoryNav({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Categorías" className="hidden min-w-0 flex-1 md:block">
      <ul className="flex items-center gap-6 overflow-x-auto text-sm font-medium whitespace-nowrap">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/categoria/${category.slug}`}
              className="text-foreground/80 transition-colors hover:text-foreground"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
