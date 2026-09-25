import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCents } from "@/lib/money";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: { category: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button nativeButton={false} render={<Link href="/admin/productos/nuevo" />}>
          Nuevo producto
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category.name}</TableCell>
                <TableCell>{formatCents(product.priceCents)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Badge variant={product.isActive ? "default" : "outline"}>
                    {product.isActive ? "Visible" : "Oculto"}
                  </Badge>
                </TableCell>
                <TableCell className="flex justify-end gap-2 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<Link href={`/admin/productos/${product.id}`} />}
                  >
                    Editar
                  </Button>
                  <DeleteProductButton productId={product.id} productName={product.name} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
