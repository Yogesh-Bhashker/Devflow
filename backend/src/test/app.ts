import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Import all route modules
import userRoutes from "../modules/users/user.routes";
import projectRoutes from "../modules/projects/project.routes";
import memberRoutes from "../modules/members/member.routes";
import taskRoutes from "../modules/tasks/task.routes";
import notificationRoutes from "../modules/notifications/notification.routes";
import { authenticate } from "../middleware/auth.middleware";

// Re-build auth routes WITHOUT rate limiter (for tests only)
import { Router } from "express";
import { register, login, refresh, logout } from "../modules/auth/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { registerSchema, loginSchema } from "../modules/auth/auth.schema";

function createTestAuthRouter() {
  const router = Router();
  router.post("/register", validate(registerSchema), register);
  router.post("/login", validate(loginSchema), login);
  router.post("/refresh", refresh);
  router.post("/logout", logout);
  return router;
}

/**
 * Creates a fresh Express app for testing.
 * Does NOT call httpServer.listen (no side effects).
 * Does NOT use rate limiters (they'd fail tests after N requests).
 */
export function createTestApp() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.use("/api/auth", createTestAuthRouter());
  app.use("/api/users", authenticate, userRoutes);
  app.use("/api/projects/:projectId/members", authenticate, memberRoutes);
  app.use("/api/projects", authenticate, projectRoutes);
  app.use("/api/tasks", authenticate, taskRoutes);
  app.use("/api/notifications", authenticate, notificationRoutes);

  return app;
}