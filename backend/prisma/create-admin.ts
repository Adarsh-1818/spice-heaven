import "dotenv/config";
import bcrypt from "bcryptjs";

import { prisma } from "../src/config/prisma.js";

async function main() {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required",
    );
  }

  if (password.length < 12) {
    throw new Error(
      "ADMIN_PASSWORD must be at least 12 characters long",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const existingUser = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase().trim(),
    },
  });

  if (existingUser) {
    const updatedUser = await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        name,
        passwordHash,
        role: "ADMIN",
      },
    });

    console.log(`Admin account updated: ${updatedUser.email}`);
    return;
  }

  const admin = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`Admin account created: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error("Failed to create admin account:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });