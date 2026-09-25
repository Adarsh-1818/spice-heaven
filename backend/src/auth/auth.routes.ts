import { Router } from "express";

import { loginController } from "./auth.controller.js";
import { registerCustomerController } from "./customer.controller.js";

const router = Router();

router.post("/login", loginController);

router.post(
  "/register",
  registerCustomerController,
);

export default router;