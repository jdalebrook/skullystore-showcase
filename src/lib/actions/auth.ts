"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const BCRYPT_ROUNDS = 12;

const SignupSchema = z.object({
  name: z.string().trim().min(2, { error: "El nombre debe tener al menos 2 caracteres." }),
  email: z.email({ error: "Introduce un email válido." }).trim().toLowerCase(),
  password: z
    .string()
    .min(10, { error: "La contraseña debe tener al menos 10 caracteres." })
    .regex(/[a-zA-Z]/, { error: "Debe contener al menos una letra." })
    .regex(/[0-9]/, { error: "Debe contener al menos un número." }),
});

export type SignupState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export async function signup(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const validatedFields = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: z.flattenError(validatedFields.error).fieldErrors };
  }

  const { name, email, password } = validatedFields.data;

  const { allowed } = rateLimit(`signup:${email}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return { message: "Demasiados intentos. Inténtalo de nuevo más tarde." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { message: "Ya existe una cuenta con ese email." };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  await prisma.user.create({
    data: { name, email, passwordHash },
  });

  await signIn("credentials", { email, password, redirectTo: "/cuenta" });
}

export type LoginState = string | undefined;

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  // El límite de intentos se aplica en `authorize()` (src/lib/auth.ts), que
  // es el único punto por el que pasa cualquier intento de login venga de
  // donde venga (formulario o llamada directa al callback de NextAuth).
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/cuenta",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Email o contraseña incorrectos.";
        default:
          return "Algo ha ido mal. Inténtalo de nuevo.";
      }
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/cuenta" });
}
