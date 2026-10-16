import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import jwt from "jsonwebtoken";
import { JWT_SECRET, CORS_ORIGINS } from "../config/env";
import prisma from "./prisma";

let io: SocketServer;

export function initSocket(httpServer: HttpServer) {
  io = new SocketServer(httpServer, {
    cors: { origin: CORS_ORIGINS, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as number;
    socket.join(`user:${userId}`);
    console.log(`socket connected: user ${userId}`);

    socket.on("join:project", async (projectId: number) => {
      const member = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: Number(projectId), userId } },
      });
      if (member) socket.join(`project:${Number(projectId)}`);
    });
  });

  return io;
}

export function emitToProject(projectId: number, event: string, data: unknown) {
  io.to(`project:${projectId}`).emit(event, data);
}

export async function emitToUser(userId: number, event: string, data: unknown) {
  const sockets = await io.in(`user:${userId}`).fetchSockets();
  console.log(`emit ${event} -> user ${userId}, connected sockets: ${sockets.length}`);
  io.to(`user:${userId}`).emit(event, data);
}