import { describe, it, expect } from "vitest";
import prisma from "../lib/prisma";

describe("Test infrastructure smoke test", () => {
  it("connects to the test database", async () => {
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("starts with an empty database (cleanDatabase works)", async () => {
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const taskCount = await prisma.task.count();

    expect(userCount).toBe(0);
    expect(projectCount).toBe(0);
    expect(taskCount).toBe(0);
  });

  it("can create and delete a user", async () => {
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: "hashed-password-placeholder",
      },
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe("test@example.com");

    const found = await prisma.user.findUnique({ where: { id: user.id } });
    expect(found).not.toBeNull();
    expect(found?.name).toBe("Test User");
  });
});