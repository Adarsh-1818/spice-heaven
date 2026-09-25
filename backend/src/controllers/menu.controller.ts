import type { Request, Response } from "express";

import {
  getCategories,
  getMenuItems,
  getRestaurantSettings,
} from "../services/menu.service.js";

export async function getCategoriesController(
  _req: Request,
  res: Response,
) {
  try {
    const categories = await getCategories();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Failed to fetch categories:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
}

export async function getMenuController(
    req: Request,
    res: Response,
  ) {
    try {
      const categoryId =
        typeof req.query.categoryId === "string"
          ? req.query.categoryId
          : undefined;
  
      const menuItems = await getMenuItems(categoryId);
  
      const data = menuItems.map((item) => ({
        id: item.id,
        categoryId: item.categoryId,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable,
        sortOrder: item.sortOrder,
        category: {
          id: item.category.id,
          name: item.category.name,
          description: item.category.description,
          imageUrl: item.category.imageUrl,
          isActive: item.category.isActive,
        },
      }));
  
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Failed to fetch menu:", error);
  
      res.status(500).json({
        success: false,
        message: "Failed to fetch menu",
      });
    }
  }

export async function getRestaurantSettingsController(
  _req: Request,
  res: Response,
) {
  try {
    const settings = await getRestaurantSettings();

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Restaurant settings not found",
      });
    }

    res.json({
      success: true,
      data: {
        ...settings,
        minimumOrderAmount: Number(settings.minimumOrderAmount),
        deliveryFee: Number(settings.deliveryFee),
        freeDeliveryAbove: Number(settings.freeDeliveryAbove),
        deliveryRadiusMiles: Number(settings.deliveryRadiusMiles),
      },
    });
  } catch (error) {
    console.error("Failed to fetch restaurant settings:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant settings",
    });
  }
}