import { prisma } from "../config/prisma.js";

export async function getCategories() {
  return prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
}

export async function getMenuItems(categoryId?: string) {
  return prisma.menuItem.findMany({
    where: {
      isAvailable: true,
      ...(categoryId ? { categoryId } : {}),
    },
    include: {
      category: true,
    },
    orderBy: [
      {
        category: {
          sortOrder: "asc",
        },
      },
      {
        sortOrder: "asc",
      },
    ],
  });
}

export async function getRestaurantSettings() {
  return prisma.restaurantSettings.findFirst();
}