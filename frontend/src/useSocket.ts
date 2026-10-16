import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { getAccessToken, refreshAccessToken } from "./api";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: (cb) => cb({ token: getAccessToken() }),
});

// Token expire ho gaya ho toh naya lekar dobara connect karo
socket.on("connect_error", async (err) => {
  if (err.message === "Invalid token") {
    const token = await refreshAccessToken();
    if (token) socket.connect();
  }
});

export function connectSocket(_token?: string) {
  if (socket.connected) socket.disconnect();
  socket.connect();
}

export function useProjectSocket(projectId: number, onUpdate: () => void) {
  const callback = useRef(onUpdate);
  callback.current = onUpdate;

  useEffect(() => {
    const join = () => socket.emit("join:project", projectId);
    join();
    socket.on("connect", join); // reconnect ke baad room dobara join

    const handler = () => callback.current();
    socket.on("task:created", handler);
    socket.on("task:updated", handler);
    socket.on("task:deleted", handler);

    return () => {
      socket.off("connect", join);
      socket.off("task:created", handler);
      socket.off("task:updated", handler);
      socket.off("task:deleted", handler);
    };
  }, [projectId]);
}

export interface AppNotification {
  id: number;
  type: "TASK_ASSIGNED" | "TASK_UPDATED" | "MEMBER_ADDED";
  message: string;
  projectId: number | null;
  taskId: number | null;
  read: boolean;
  createdAt: string;
}

export function useNotificationSocket(onNew: (n: AppNotification) => void) {
  const callback = useRef(onNew);
  callback.current = onNew;

  useEffect(() => {
    const handler = (n: AppNotification) => callback.current(n);
    socket.on("notification:new", handler);
    return () => {
      socket.off("notification:new", handler);
    };
  }, []);
}