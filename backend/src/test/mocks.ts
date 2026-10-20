import { vi } from "vitest";

/**
 * Mock the socket module so tests don't need a real Socket.io server.
 * Import this file BEFORE importing any controller that uses emitToProject.
 */
vi.mock("../lib/socket", () => ({
  emitToProject: vi.fn(),
  emitToUser: vi.fn(async () => undefined),
  initSocket: vi.fn(),
}));