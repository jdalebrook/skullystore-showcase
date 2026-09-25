import "dotenv/config";
import { sendPasswordResetEmail } from "../src/lib/email";

// Envía un email de prueba real usando la configuración SMTP actual. Uso:
//   TEST_EMAIL_TO=tu@email.com npx tsx scripts/test-email.ts

async function main() {
  const to = process.env.TEST_EMAIL_TO;
  if (!to) {
    throw new Error("Define TEST_EMAIL_TO como variable de entorno.");
  }

  await sendPasswordResetEmail(to, "https://store.bskully.es/restablecer-password?token=test");
  console.log(`Email de prueba enviado (o registrado en consola si SMTP no está configurado) a ${to}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
