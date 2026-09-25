import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [categoryCount, productCount, lowStockCount, pendingOrderCount] =
    await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.product.count({ where: { stock: { lt: 5 }, isActive: true } }),
      prisma.order.count({ where: { status: "PENDING" } }),
    ]);

  const stats = [
    { label: "Categorías", value: categoryCount, href: "/admin/categorias" },
    { label: "Productos", value: productCount, href: "/admin/productos" },
    { label: "Stock bajo (<5)", value: lowStockCount, href: "/admin/productos" },
    { label: "Pedidos pendientes", value: pendingOrderCount, href: "/admin/pedidos" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat) => (
        <Link
          key={stat.label}
          href={stat.href}
          className="rounded-xl border border-border p-4 transition-colors hover:border-foreground/30"
        >
          <p className="text-2xl font-semibold">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </Link>
      ))}
    </div>
  );
}
