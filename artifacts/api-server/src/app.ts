import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { existsSync } from "fs";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Rate limiting cho auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 20,
  message: { error: "Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút!" },
  standardHeaders: true,
  legacyHeaders: false,
});

// API routes
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api", router);

// Serve frontend static files (production only)
const frontendDist = path.resolve(process.cwd(), "artifacts/jnmt-hub/dist/public");

if (existsSync(frontendDist)) {
  logger.info({ frontendDist }, "Serving frontend static files");
  app.use(express.static(frontendDist));

  // SPA fallback — serve index.html for all non-API routes
  app.get("{/*path}", (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  logger.warn({ frontendDist }, "Frontend dist not found — skipping static serve");
}

// Global error handler (must be last)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, "Unhandled server error");
  res.status(500).json({ error: "Lỗi server! Vui lòng thử lại sau." });
});

export default app;
