import type {
    NextFunction,
    Request,
    Response,
  } from "express";
  
  import jwt from "jsonwebtoken";
  
  import { env } from "../config/env.js";
  
  export interface AuthTokenPayload {
    userId: string;
    role: "CUSTOMER" | "ADMIN";
  }
  
  export interface AuthenticatedRequest extends Request {
    user?: AuthTokenPayload;
  }
  
  export function requireAdmin(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const authorization = req.headers.authorization;
  
      if (!authorization) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }
  
      const [scheme, token] = authorization.split(" ");
  
      if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
          success: false,
          message: "Invalid authentication format",
        });
      }
  
      const decoded = jwt.verify(
        token,
        env.jwtSecret,
      ) as AuthTokenPayload;
  
      if (decoded.role !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message: "Admin access required",
        });
      }
  
      req.user = decoded;
  
      next();
    } catch (error) {
      console.error("Authentication failed:", error);
  
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token",
      });
    }
  }
  
  export function requireCustomer(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const authorization = req.headers.authorization;
  
      if (!authorization) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }
  
      const [scheme, token] = authorization.split(" ");
  
      if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
          success: false,
          message: "Invalid authentication format",
        });
      }
  
      const decoded = jwt.verify(
        token,
        env.jwtSecret,
      ) as AuthTokenPayload;
  
      if (decoded.role !== "CUSTOMER") {
        return res.status(403).json({
          success: false,
          message: "Customer access required",
        });
      }
  
      req.user = decoded;
  
      next();
    } catch (error) {
      console.error("Authentication failed:", error);
  
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token",
      });
    }
  }