import { Router } from "express";

import {
  getCategoriesController,
  getMenuController,
  getRestaurantSettingsController,
} from "../controllers/menu.controller.js";

const router = Router();

router.get("/categories", getCategoriesController);

router.get("/menu", getMenuController);

router.get("/settings", getRestaurantSettingsController);

export default router;