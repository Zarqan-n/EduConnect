import 'dotenv/config'; // loads variables from .env (see .env.example)
import express, { type Request, Response, NextFunction } from "express";
// set HUGGINGFACE_API_KEY in your .env when using Hugging Face inference API
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { storage } from "./storage";
import { hashPassword } from "./auth";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { initializeDatabase } from "./init-db";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

}

async function ensureAdminUser() {
  try {
    const [existingAdmin] = await db.select().from(users).where(eq(users.role, "admin")).limit(1);
    if (!existingAdmin) {
      const password = await hashPassword("admin123");
      await storage.createUser({
        username: "admin",
        password,
        role: "admin",
        name: "Admin",
        email: "admin@educonnect.com",
      });
      log("Default admin account created (username: admin, password: admin123)", "setup");
    }
  } catch (err: any) {
    console.warn("Could not auto-create admin user:", err?.message || err);
  }
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (path !== "/api/chat" && capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Initialize database and run migrations first
    await initializeDatabase();
  } catch (error) {
    console.error("Fatal: Database initialization failed:", error);
    process.exit(1);
  }

  await registerRoutes(httpServer, app);
  await ensureAdminUser();

  // lightweight health check for platform load balancers
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  const listenOpts: any = { port, host: "0.0.0.0" };
  if (process.platform !== "win32") {
    listenOpts.reusePort = true;
  }

  httpServer.listen(listenOpts, () => {
    log(`serving on port ${port}`);
  });
})();
