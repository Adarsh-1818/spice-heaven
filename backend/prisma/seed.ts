import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing demo data
  await prisma.menuItemAddon.deleteMany();
  await prisma.orderItemAddon.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.deliveryAddress.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.addon.deleteMany();
  await prisma.restaurantSettings.deleteMany();

  // Categories
  const starters = await prisma.category.create({
    data: {
      name: "Starters",
      description: "Perfect dishes to start your meal.",
      sortOrder: 1,
    },
  });

  const mains = await prisma.category.create({
    data: {
      name: "Main Course",
      description: "Our most popular filling dishes.",
      sortOrder: 2,
    },
  });

  const biryani = await prisma.category.create({
    data: {
      name: "Biryani",
      description: "Aromatic rice dishes packed with flavour.",
      sortOrder: 3,
    },
  });

  const sides = await prisma.category.create({
    data: {
      name: "Sides",
      description: "Complete your meal with a tasty side.",
      sortOrder: 4,
    },
  });

  const drinks = await prisma.category.create({
    data: {
      name: "Drinks",
      description: "Refreshing drinks to go with your food.",
      sortOrder: 5,
    },
  });

  // Menu items
  await prisma.menuItem.createMany({
    data: [
      {
        categoryId: starters.id,
        name: "Chicken Tikka",
        description: "Tender grilled chicken pieces marinated in aromatic spices.",
        price: 7.5,
        sortOrder: 1,
      },
      {
        categoryId: starters.id,
        name: "Vegetable Samosa",
        description: "Crispy pastry filled with spiced potatoes and vegetables.",
        price: 4.5,
        sortOrder: 2,
      },
      {
        categoryId: starters.id,
        name: "Onion Bhaji",
        description: "Crispy spiced onion fritters served with dip.",
        price: 4.5,
        sortOrder: 3,
      },

      {
        categoryId: mains.id,
        name: "Butter Chicken",
        description: "Creamy tomato curry with tender chicken and aromatic spices.",
        price: 12.5,
        sortOrder: 1,
      },
      {
        categoryId: mains.id,
        name: "Chicken Tikka Masala",
        description: "Grilled chicken cooked in a rich spiced tomato sauce.",
        price: 12.5,
        sortOrder: 2,
      },
      {
        categoryId: mains.id,
        name: "Lamb Rogan Josh",
        description: "Slow-cooked lamb in a rich Kashmiri-style curry.",
        price: 13.5,
        sortOrder: 3,
      },
      {
        categoryId: mains.id,
        name: "Chana Masala",
        description: "Chickpeas cooked with tomatoes, onions and aromatic spices.",
        price: 10.5,
        sortOrder: 4,
      },

      {
        categoryId: biryani.id,
        name: "Chicken Biryani",
        description: "Fragrant basmati rice layered with spiced chicken.",
        price: 13.5,
        sortOrder: 1,
      },
      {
        categoryId: biryani.id,
        name: "Lamb Biryani",
        description: "Aromatic basmati rice cooked with tender spiced lamb.",
        price: 14.5,
        sortOrder: 2,
      },
      {
        categoryId: biryani.id,
        name: "Vegetable Biryani",
        description: "Fragrant rice cooked with seasonal vegetables and spices.",
        price: 11.5,
        sortOrder: 3,
      },

      {
        categoryId: sides.id,
        name: "Garlic Naan",
        description: "Soft naan topped with garlic and coriander.",
        price: 3.5,
        sortOrder: 1,
      },
      {
        categoryId: sides.id,
        name: "Pilau Rice",
        description: "Fragrant basmati rice cooked with aromatic spices.",
        price: 3.5,
        sortOrder: 2,
      },
      {
        categoryId: sides.id,
        name: "Chips",
        description: "Crispy golden chips.",
        price: 3,
        sortOrder: 3,
      },

      {
        categoryId: drinks.id,
        name: "Mango Lassi",
        description: "Creamy yoghurt drink blended with sweet mango.",
        price: 4,
        sortOrder: 1,
      },
      {
        categoryId: drinks.id,
        name: "Coca-Cola",
        description: "330ml can.",
        price: 2,
        sortOrder: 2,
      },
      {
        categoryId: drinks.id,
        name: "Still Water",
        description: "500ml bottled water.",
        price: 1.5,
        sortOrder: 3,
      },
    ],
  });

  // Restaurant settings
  await prisma.restaurantSettings.create({
    data: {
      restaurantName: "Spice Haven",
      phone: "020 0000 0000",
      email: "hello@spicehaven.co.uk",
      address: "London, UK",
      minimumOrderAmount: 10,
      deliveryFee: 2.5,
      freeDeliveryAbove: 25,
      deliveryRadiusMiles: 5,
      isOpen: true,
    },
  });

  console.log("✅ Database seed completed.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });