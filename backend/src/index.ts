import "./config/env";                       // <-- sabse pehle, .env load karta hai
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { createServer } from "http";

import taskRoutes from "./modules/tasks/task.routes";
import userRoutes from "./modules/users/user.routes";
import projectRoutes from "./modules/projects/project.routes";
import authRoutes from "./modules/auth/auth.routes";
import memberRoutes from "./modules/members/member.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
import { authenticate } from "./middleware/auth.middleware";
import { initSocket } from "./lib/socket";
import { PORT, CORS_ORIGINS } from "./config/env";
import { generalLimiter } from "./middleware/rateLimit.middleware";

const app = express();
const httpServer = createServer(app);
initSocket(httpServer);

app.use(helmet());
app.use(
  cors({
    origin: CORS_ORIGINS,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", message: "DevFlow API is running" });
});

// Global rate limit for all API routes below this point
app.use("/api", generalLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/users", authenticate, userRoutes);
app.use("/api/projects/:projectId/members", authenticate, memberRoutes);
app.use("/api/projects", authenticate, projectRoutes);
app.use("/api/tasks", authenticate, taskRoutes);
app.use("/api/notifications", authenticate, notificationRoutes);

httpServer.listen(PORT, () => {
  console.log(`DevFlow server is running on port ${PORT}`);
});