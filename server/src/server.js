import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import financeRoutes from "./routes/finance.js";
import adminRoutes from "./routes/admin.js";
import { auth } from "./middleware/auth.js";
import { prisma } from "./prisma.js";
const app = express();
app.set("trust proxy", 1);
const isProduction = process.env.NODE_ENV === "production";
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
if (isProduction) {
  const required = ["DATABASE_URL", "JWT_SECRET", "CLIENT_URL"];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing production environment variables: ${missing.join(", ")}`);
  if (process.env.JWT_SECRET.length < 32) throw new Error("JWT_SECRET must be at least 32 characters in production.");
}
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Try again later." },
});
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed =
        !origin ||
        origin === clientUrl ||
        (!isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
      callback(null, allowed);
    },
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json({ limit: "100kb" }));
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isStateChanging = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
  if (isStateChanging && origin && origin !== clientUrl) {
    return res.status(403).json({ message: "Blocked by cross-origin policy." });
  }
  next();
});
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "unavailable", database: "unavailable" });
  }
});
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api", auth(), financeRoutes);
app.use("/api/admin", auth(true), adminRoutes);
app.use((err, req, res, next) => {
  if (err.name === "ZodError")
    return res.status(400).json({ message: err.issues[0].message });
  console.error(err);
  res.status(500).json({ message: "Something went wrong." });
});
app.listen(process.env.PORT || 4000, () =>
  console.log("API running on port 4000"),
);
