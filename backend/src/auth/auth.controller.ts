import type { Request, Response } from "express";
import { z } from "zod";

import { loginUser } from "./auth.service.js";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});

export async function loginController(
  req: Request,
  res: Response,
) {
  try {
    const input = loginSchema.parse(req.body);

    const result = await loginUser(input);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid login details",
        errors: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    return res.status(401).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to login",
    });
  }
}