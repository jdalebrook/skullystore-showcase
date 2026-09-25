"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const AddressSchema = z.object({
  label: z.string().trim().optional(),
  fullName: z.string().trim().min(2, { error: "Indica un nombre completo." }),
  line1: z.string().trim().min(3, { error: "Indica una dirección." }),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, { error: "Indica una ciudad." }),
  province: z.string().trim().optional(),
  postalCode: z.string().trim().min(3, { error: "Indica un código postal." }),
  phone: z.string().trim().optional(),
});

export type AddressState =
  | {
      errors?: Record<string, string[]>;
    }
  | undefined;

export async function addAddress(
  _prevState: AddressState,
  formData: FormData
): Promise<AddressState> {
  const user = await requireUser();

  const validatedFields = AddressSchema.safeParse({
    label: formData.get("label") || undefined,
    fullName: formData.get("fullName"),
    line1: formData.get("line1"),
    line2: formData.get("line2") || undefined,
    city: formData.get("city"),
    province: formData.get("province") || undefined,
    postalCode: formData.get("postalCode"),
    phone: formData.get("phone") || undefined,
  });

  if (!validatedFields.success) {
    return { errors: z.flattenError(validatedFields.error).fieldErrors };
  }

  await prisma.address.create({
    data: { ...validatedFields.data, userId: user.id },
  });

  revalidatePath("/cuenta/direcciones");
}

export async function deleteAddress(addressId: string) {
  const user = await requireUser();

  await prisma.address.deleteMany({
    where: { id: addressId, userId: user.id },
  });

  revalidatePath("/cuenta/direcciones");
}
