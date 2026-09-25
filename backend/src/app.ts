import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./auth/auth.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import orderRoutes from "./routes/order.routes.js";


import { env } from "./config/env.js";

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
  }),
);

app.use(helmet());

app.use(express.json());

app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Spice Haven API is running",
  });
});

app.use("/api", menuRoutes);
app.use("/api", orderRoutes);

export default app;