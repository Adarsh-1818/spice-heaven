import { prisma } from "../config/prisma.js";

interface CreateOrderInput {
    userId?: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };

  orderType: "DELIVERY" | "COLLECTION";

  paymentMethod: "CASH" | "CARD";

  items: {
    menuItemId: string;
    quantity: number;
    notes?: string;
  }[];

  deliveryAddress?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postcode: string;
  };

  notes?: string;
}

export async function createOrder(input: CreateOrderInput) {
  const settings = await prisma.restaurantSettings.findFirst();

  if (!settings) {
    throw new Error("Restaurant settings not found");
  }

  if (!input.items.length) {
    throw new Error("Order must contain at least one item");
  }

  if (
    input.orderType === "DELIVERY" &&
    !input.deliveryAddress
  ) {
    throw new Error(
      "Delivery address is required for delivery orders",
    );
  }

  const menuItemIds = input.items.map(
    (item) => item.menuItemId,
  );

  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: {
        in: menuItemIds,
      },
      isAvailable: true,
    },
  });
  
  const menuItemsById = new Map(
    menuItems.map((item) => [item.id, item]),
  );
  
  for (const inputItem of input.items) {
    if (!menuItemsById.has(inputItem.menuItemId)) {
      throw new Error(
        "One or more menu items are unavailable",
      );
    }
  }

  let subtotal = 0;

  const orderItems = input.items.map((inputItem) => {
    const menuItem = menuItemsById.get(
        inputItem.menuItemId,
      );

    if (!menuItem) {
      throw new Error("Menu item not found");
    }

    if (
      !Number.isInteger(inputItem.quantity) ||
      inputItem.quantity < 1
    ) {
      throw new Error(
        "Item quantity must be at least 1",
      );
    }

    const unitPrice = Number(menuItem.price);
    const itemSubtotal =
      unitPrice * inputItem.quantity;

    subtotal += itemSubtotal;

    return {
      menuItemId: menuItem.id,
      itemName: menuItem.name,
      unitPrice,
      quantity: inputItem.quantity,
      notes: inputItem.notes,
      subtotal: itemSubtotal,
    };
  });

  if (
    subtotal < Number(settings.minimumOrderAmount)
  ) {
    throw new Error(
      `Minimum order amount is £${Number(
        settings.minimumOrderAmount,
      ).toFixed(2)}`,
    );
  }

  let deliveryFee = 0;

  if (input.orderType === "DELIVERY") {
    deliveryFee =
      subtotal >= Number(settings.freeDeliveryAbove)
        ? 0
        : Number(settings.deliveryFee);
  }

  const total = subtotal + deliveryFee;

  const order = await prisma.order.create({
    data: {
        userId: input.userId,
      customerName: input.customer.name,
      customerPhone: input.customer.phone,
      customerEmail: input.customer.email,
      orderType: input.orderType,
      paymentMethod: input.paymentMethod,
      subtotal,
      deliveryFee,
      total,
      customerNotes: input.notes,

      items: {
        create: orderItems,
      },

      ...(input.orderType === "DELIVERY" &&
      input.deliveryAddress
        ? {
            deliveryAddress: {
              create: input.deliveryAddress,
            },
          }
        : {}),
    },

    include: {
      items: true,
      deliveryAddress: true,
    },
  });

  return order;
}

export async function getOrderById(orderId: string) {
    return prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
        deliveryAddress: true,
      },
    });
  }

  const allowedOrderStatuses = [
    "PENDING",
    "ACCEPTED",
    "PREPARING",
    "READY",
    "OUT_FOR_DELIVERY",
    "COMPLETED",
    "CANCELLED",
  ] as const;
  
  type OrderStatus = (typeof allowedOrderStatuses)[number];
  
  export async function updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ) {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });
  
    if (!order) {
      throw new Error("Order not found");
    }
  
    if (!allowedOrderStatuses.includes(status)) {
      throw new Error("Invalid order status");
    }
  
    if (
      status === "OUT_FOR_DELIVERY" &&
      order.orderType !== "DELIVERY"
    ) {
      throw new Error(
        "Collection orders cannot be marked as out for delivery",
      );
    }
  
    if (
      status === "COMPLETED" &&
      order.orderType === "DELIVERY" &&
      order.status !== "OUT_FOR_DELIVERY"
    ) {
      throw new Error(
        "Delivery orders must be marked out for delivery before completion",
      );
    }
  
    if (
      status === "COMPLETED" &&
      order.orderType === "COLLECTION" &&
      order.status !== "READY"
    ) {
      throw new Error(
        "Collection orders must be ready before completion",
      );
    }
    if (
        status === "CANCELLED" &&
        ["COMPLETED", "CANCELLED"].includes(order.status)
      ) {
        throw new Error(
          `Cannot cancel an order with status ${order.status}`,
        );
      }
  
    return prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
      include: {
        items: true,
        deliveryAddress: true,
      },
    });
  }

  export async function getOrders(status?: string) {
    return prisma.order.findMany({
      where: status
        ? {
            status: status as
              | "PENDING"
              | "ACCEPTED"
              | "PREPARING"
              | "READY"
              | "OUT_FOR_DELIVERY"
              | "COMPLETED"
              | "CANCELLED",
          }
        : undefined,
  
      include: {
        items: true,
        deliveryAddress: true,
      },
  
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  export async function getMyOrders(userId: string) {
    return prisma.order.findMany({
      where: {
        userId,
      },
      include: {
        items: true,
        deliveryAddress: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }