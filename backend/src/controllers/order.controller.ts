import type {
    Request,
    Response,
  } from "express";
  import type {
    AuthenticatedRequest,
  } from "../middleware/auth.middleware.js";
import { z } from "zod";

import { createOrder, getOrderById, updateOrderStatus, getOrders, getMyOrders,} from "../services/order.service.js";
import { createOrderSchema, updateOrderStatusSchema, } from "../validators/order.validator.js";

export async function createOrderController(
    req: AuthenticatedRequest,
    res: Response,  
) {
  try {
    const validatedOrder = createOrderSchema.parse(req.body);
    const order = await createOrder({
        ...validatedOrder,
        userId: req.user?.userId,
      })

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        id: order.id,
        status: order.status,
        orderType: order.orderType,
        paymentMethod: order.paymentMethod,
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.deliveryFee),
        total: Number(order.total),
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          id: item.id,
          menuItemId: item.menuItemId,
          itemName: item.itemName,
          unitPrice: Number(item.unitPrice),
          quantity: item.quantity,
          subtotal: Number(item.subtotal),
        })),
        deliveryAddress: order.deliveryAddress,
      },
    });
  } catch (error) {
    console.error("Failed to create order:", error);

    if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid order details",
          errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
    
        return;
      }


    const message =
      error instanceof Error
        ? error.message
        : "Failed to create order";

    res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function getOrderController(
    req: Request,
    res: Response,
  ) {
    try {
        const orderId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
  
      const order = await getOrderById(orderId);
  
      if (!order) {
        res.status(404).json({
          success: false,
          message: "Order not found",
        });
        return;
      }
  
      res.json({
        success: true,
        data: {
          id: order.id,
          status: order.status,
          orderType: order.orderType,
          paymentMethod: order.paymentMethod,
          subtotal: Number(order.subtotal),
          deliveryFee: Number(order.deliveryFee),
          total: Number(order.total),
          createdAt: order.createdAt,
          items: order.items.map((item) => ({
            id: item.id,
            menuItemId: item.menuItemId,
            itemName: item.itemName,
            unitPrice: Number(item.unitPrice),
            quantity: item.quantity,
            subtotal: Number(item.subtotal),
          })),
          deliveryAddress: order.deliveryAddress,
        },
      });
    } catch (error) {
      console.error("Failed to fetch order:", error);
  
      res.status(500).json({
        success: false,
        message: "Failed to fetch order",
      });
    }
}

export async function updateOrderStatusController(
    req: Request,
    res: Response,
  ) {
    try {
      const orderId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
  
      const validatedData =
        updateOrderStatusSchema.parse(req.body);
  
      const order = await updateOrderStatus(
        orderId,
        validatedData.status,
      );
  
      res.json({
        success: true,
        message: "Order status updated successfully",
        data: {
          id: order.id,
          status: order.status,
          orderType: order.orderType,
          paymentMethod: order.paymentMethod,
          subtotal: Number(order.subtotal),
          deliveryFee: Number(order.deliveryFee),
          total: Number(order.total),
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          items: order.items.map((item) => ({
            id: item.id,
            menuItemId: item.menuItemId,
            itemName: item.itemName,
            unitPrice: Number(item.unitPrice),
            quantity: item.quantity,
            subtotal: Number(item.subtotal),
          })),
          deliveryAddress: order.deliveryAddress,
        },
      });
    } catch (error) {
      console.error(
        "Failed to update order status:",
        error,
      );
  
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid order status",
          errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
  
        return;
      }
  
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update order status";
  
      const statusCode =
        message === "Order not found" ? 404 : 400;
  
      res.status(statusCode).json({
        success: false,
        message,
      });
    }
}

export async function getOrdersController(
    req: Request,
    res: Response,
  ) {
    try {
      const status =
        typeof req.query.status === "string"
          ? req.query.status
          : undefined;
  
      const orders = await getOrders(status);
  
      res.json({
        success: true,
        data: orders.map((order) => ({
          id: order.id,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerEmail: order.customerEmail,
          orderType: order.orderType,
          paymentMethod: order.paymentMethod,
          status: order.status,
          subtotal: Number(order.subtotal),
          deliveryFee: Number(order.deliveryFee),
          total: Number(order.total),
          customerNotes: order.customerNotes,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
  
          items: order.items.map((item) => ({
            id: item.id,
            menuItemId: item.menuItemId,
            itemName: item.itemName,
            unitPrice: Number(item.unitPrice),
            quantity: item.quantity,
            notes: item.notes,
            subtotal: Number(item.subtotal),
          })),
  
          deliveryAddress: order.deliveryAddress,
        })),
      });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
  
      res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
      });
    }
  }

  export async function getMyOrdersController(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }
  
      const orders = await getMyOrders(
        req.user.userId,
      );
  
      return res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      console.error(
        "Failed to fetch customer orders:",
        error,
      );
  
      return res.status(500).json({
        success: false,
        message: "Unable to fetch your orders",
      });
    }
  }