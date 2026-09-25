import type { Request, Response } from "express";
import { z } from "zod";

import { registerCustomer } from "./customer.service.js";

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),

  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(30, "Phone number is too long")
    .optional(),
});

export async function registerCustomerController(
  req: Request,
  res: Response,
) {
  try {
    const input = registerSchema.parse(req.body);

    const user = await registerCustomer(input);

    return res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration details",
        errors: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    return res.status(409).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to create account",
    });
  }
}