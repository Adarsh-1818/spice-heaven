import bcrypt from "bcryptjs";

import { prisma } from "../config/prisma.js";

interface RegisterCustomerInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export async function registerCustomer(
  input: RegisterCustomerInput,
) {
  const email = input.email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(
    input.password,
    12,
  );

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      passwordHash,
      phone: input.phone?.trim() || undefined,
      role: "CUSTOMER",
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}