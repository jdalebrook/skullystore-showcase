import Link from "next/link";
import { requireAdmin } from "@/lib/session";

const links = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/recordatorios", label: "Recordatorios" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Administración
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[160px_1fr]">
        <nav aria-label="Navegación de administración">
          <ul className="flex flex-row flex-wrap gap-x-4 gap-y-2 md:flex-col">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-foreground/70 hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>{children}</div>
      </div>
    </div>
  );
}
