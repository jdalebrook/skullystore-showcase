import { LikeRemindersForm } from "@/components/admin/like-reminders-form";

export default function AdminRemindersPage() {
  return (
    <div>
      <h2 className="mb-2 text-sm font-medium tracking-wide text-muted-foreground uppercase">
        Recordatorios de &ldquo;me gusta&rdquo;
      </h2>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Manda un email con la imagen del producto a quien le dio like y
        todavía no lo ha comprado (solo productos activos con stock). Esto es
        correo comercial, no transaccional -- lánzalo solo cuando tengas
        claro el consentimiento de a quién le estás escribiendo. Marca
        &ldquo;Solo previsualizar&rdquo; para ver a quién le tocaría sin
        enviar nada.
      </p>
      <LikeRemindersForm />
    </div>
  );
}
