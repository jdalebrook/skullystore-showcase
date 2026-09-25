// Recordatorio manual de "sigue disponible" a quien dio like a un producto y
// todavía no lo ha comprado. A propósito NO está en un cron -- es email
// comercial (no transaccional como el resto del correo del proyecto) y
// todavía no se ha revisado el consentimiento requerido (LSSI-CE) con
// alguien con conocimiento legal. Mismo botón disponible en /admin/recordatorios
// para quien prefiera no usar la terminal -- ambos usan runLikeReminders()
// (src/lib/like-reminders.ts).
//
//   npx tsx -r dotenv/config scripts/send-like-reminders.ts
//
// Opciones:
//   --dry-run         Lista a quién se le mandaría, sin enviar nada.
//   --min-days=N      Antigüedad mínima del like en días (por defecto 3).
import "dotenv/config";
import { runLikeReminders } from "../src/lib/like-reminders";
import { prisma } from "../src/lib/prisma";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const minDaysArg = args.find((arg) => arg.startsWith("--min-days="));
const minDays = minDaysArg ? Number(minDaysArg.split("=")[1]) : 3;

async function main() {
  const { sent, skipped, details } = await runLikeReminders({ dryRun, minDays });

  for (const detail of details) {
    console.log(`${dryRun ? "[dry-run] " : ""}Recordatorio: ${detail.email} <- "${detail.productName}"`);
  }

  console.log(
    `${dryRun ? "[dry-run] " : ""}${sent} recordatorio(s) ${dryRun ? "a punto de enviarse" : "enviados"}, ${skipped} omitido(s) (ya comprado).`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
