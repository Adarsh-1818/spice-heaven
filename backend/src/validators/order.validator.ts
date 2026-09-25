import { z } from "zod";

const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Customer name must be at least 2 characters")
    .max(100, "Customer name is too long"),

  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(30, "Phone number is too long"),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .optional(),
});

const deliveryAddressSchema = z.object({
  addressLine1: z
    .string()
    .trim()
    .min(3, "Address is required")
    .max(200),

  addressLine2: z
    .string()
    .trim()
    .max(200)
    .optional(),

  city: z
    .string()
    .trim()
    .min(2, "City is required")
    .max(100),

  postcode: z
    .string()
    .trim()
    .min(3, "Postcode is required")
    .max(20),
});

const orderItemSchema = z.object({
  menuItemId: z
    .string()
    .min(1, "Menu item ID is required"),

  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(50, "Maximum quantity is 50"),

  notes: z
    .string()
    .trim()
    .max(500, "Item notes are too long")
    .optional(),
});

export const createOrderSchema = z
  .object({
    customer: customerSchema,

    orderType: z.enum(["DELIVERY", "COLLECTION"]),

    paymentMethod: z.enum(["CASH", "CARD"]),

    items: z
    .array(orderItemSchema)
    .min(1, "Order must contain at least one item")
    .max(50, "Too many items in order")
    .superRefine((items, context) => {
      const menuItemIds = items.map(
        (item) => item.menuItemId,
      );
  
      const uniqueMenuItemIds = new Set(menuItemIds);
  
      if (uniqueMenuItemIds.size !== menuItemIds.length) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items"],
          message: "Duplicate menu items are not allowed",
        });
      }
    }),

    deliveryAddress: deliveryAddressSchema.optional(),

    notes: z
      .string()
      .trim()
      .max(1000, "Order notes are too long")
      .optional(),
  })
  .superRefine((order, context) => {
    if (
      order.orderType === "DELIVERY" &&
      !order.deliveryAddress
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryAddress"],
        message:
          "Delivery address is required for delivery orders",
      });
    }

    if (
      order.orderType === "COLLECTION" &&
      order.deliveryAddress
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryAddress"],
        message:
          "Delivery address should not be provided for collection orders",
      });
    }
  });

export type CreateOrderRequest = z.infer<
  typeof createOrderSchema
>;


export const updateOrderStatusSchema = z.object({
    status: z.enum([
      "PENDING",
      "ACCEPTED",
      "PREPARING",
      "READY",
      "OUT_FOR_DELIVERY",
      "COMPLETED",
      "CANCELLED",
    ]),
  });
  
  export type UpdateOrderStatusRequest = z.infer<
    typeof updateOrderStatusSchema
  >;