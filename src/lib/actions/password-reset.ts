"use server";

import crypto from "node:crypto";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

const GENERIC_REQUEST_MESSAGE =
  "Si existe una cuenta con ese email, te hemos enviado un enlace para restablecer la contraseña.";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export type RequestResetState = { message: string } | undefined;

export async function requestPasswordReset(
  _prevState: RequestResetState,
  formData: FormData
): Promise<RequestResetState> {
  const email = formData.get("email");
  if (typeof email !== "string" || !email.trim()) {
    return { message: "Introduce un email válido." };
  }
  const normalizedEmail = email.trim().toLowerCase();

  // Mismo mensaje siempre, límite alcanzado o no -- no revela si la cuenta existe.
  const { allowed } = rateLimit(
    `password-reset-request:${normalizedEmail}`,
    3,
    60 * 60 * 1000
  );
  if (!allowed) {
    return { message: GENERIC_REQUEST_MESSAGE };
  }

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
    const resetUrl = `${baseUrl}/restablecer-password?token=${rawToken}`;
    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (error) {
      // Un fallo de envío no debe tumbar la acción ni delatar si la cuenta
      // existe -- se registra en el servidor y se responde igual que si
      // hubiera ido bien.
      console.error("No se pudo enviar el email de recuperación:", error);
    }
  }

  return { message: GENERIC_REQUEST_MESSAGE };
}

const NewPasswordSchema = z
  .string()
  .min(10, { error: "La contraseña debe tener al menos 10 caracteres." })
  .regex(/[a-zA-Z]/, { error: "Debe contener al menos una letra." })
  .regex(/[0-9]/, { error: "Debe contener al menos un número." });

export type ResetPasswordState = { error: string } | undefined;

export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = formData.get("token");
  const password = formData.get("password");

  if (typeof token !== "string" || !token || typeof password !== "string") {
    return { error: "Faltan datos en el formulario." };
  }

  const validatedPassword = NewPasswordSchema.safeParse(password);
  if (!validatedPassword.success) {
    return { error: validatedPassword.error.issues[0]?.message ?? "Contraseña no válida." };
  }

  const { allowed } = rateLimit(`password-reset-confirm:${token.slice(0, 16)}`, 10, 15 * 60 * 1000);
  if (!allowed) {
    return { error: "Demasiados intentos. Pide un enlace nuevo." };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { error: "El enlace no es válido o ha caducado. Pide uno nuevo." };
  }

  const passwordHash = await bcrypt.hash(validatedPassword.data, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  redirect("/login");
}
