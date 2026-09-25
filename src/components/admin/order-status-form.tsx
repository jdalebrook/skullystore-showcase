"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatus } from "@/lib/actions/admin/orders";
import { useActionSuccessToast } from "@/hooks/use-action-success-toast";

const statusOptions = [
  { value: "PENDING", label: "Pendiente" },
  { value: "PAID", label: "Pagado" },
  { value: "FULFILLED", label: "Enviado" },
  { value: "CANCELLED", label: "Cancelado" },
  { value: "REFUNDED", label: "Reembolsado" },
];

export function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [, action, pending] = useActionState(async (_prevState: undefined, formData: FormData) => {
    await updateOrderStatus(orderId, formData);
    return undefined;
  }, undefined);

  useActionSuccessToast(pending, false, "Estado del pedido actualizado.");

  return (
    <form action={action} className="flex items-center gap-2">
      <Select name="status" defaultValue={currentStatus}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Guardando..." : "Actualizar"}
      </Button>
    </form>
  );
}
