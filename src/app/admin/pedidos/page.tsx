import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCents } from "@/lib/money";

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "outline",
  PAID: "default",
  FULFILLED: "secondary",
  CANCELLED: "destructive",
  REFUNDED: "destructive",
};

const statusLabel: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  FULFILLED: "Enviado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, items: true },
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Artículos</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Todavía no hay pedidos.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">{order.id.slice(-8)}</TableCell>
                <TableCell>{order.user.email}</TableCell>
                <TableCell>{order.items.reduce((sum, i) => sum + i.quantity, 0)}</TableCell>
                <TableCell>{formatCents(order.totalCents)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[order.status] ?? "outline"}>
                    {statusLabel[order.status] ?? order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Intl.DateTimeFormat("es-ES", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(order.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<Link href={`/admin/pedidos/${order.id}`} />}
                  >
                    Ver
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
