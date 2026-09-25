import { Router } from "express";

import {
  createOrderController,
  getOrderController,
  updateOrderStatusController,
  getOrdersController,
  getMyOrdersController,
} from "../controllers/order.controller.js";

import { requireAdmin, requireCustomer, } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/orders", createOrderController);

router.get(
  "/orders",
  requireAdmin,
  getOrdersController,
);

router.get(
    "/orders/my-orders",
    requireCustomer,
    getMyOrdersController,
  );

router.get(
  "/orders/:id",
  getOrderController,
);

router.patch(
  "/orders/:id/status",
  requireAdmin,
  updateOrderStatusController,
);

export default router;