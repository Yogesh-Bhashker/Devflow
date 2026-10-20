// IMPORTANT: mock socket BEFORE importing the app
import "./mocks";

import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp } from "./app";

const app = createTestApp();

// Helper: register + login, returns { accessToken, userId, email }
async function createUser(name: string, email: string) {
  await request(app).post("/api/auth/register").send({
    name,
    email,
    password: "password123",
  });

  const res = await request(app).post("/api/auth/login").send({
    email,
    password: "password123",
  });

  return {
    accessToken: res.body.accessToken as string,
    userId: res.body.user.id as number,
    email,
  };
}

describe("RBAC — role-based access control", () => {
  it("owner can create a project", async () => {
    const owner = await createUser("Alice", "alice@test.com");

    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ name: "Test Project", description: "Hello" });

    expect(res.status).toBe(201);
    expect(res.body.project.name).toBe("Test Project");
    expect(res.body.project.ownerId).toBe(owner.userId);
  });

  it("owner can add a member and a viewer", async () => {
    const owner = await createUser("Alice", "alice@test.com");
    const member = await createUser("Bob", "bob@test.com");
    const viewer = await createUser("Charlie", "charlie@test.com");

    const projectRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ name: "Test Project" });

    const projectId = projectRes.body.project.id;

    // Add Bob as MEMBER
    const addMemberRes = await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ email: member.email, role: "MEMBER" });
    expect(addMemberRes.status).toBe(201);

    // Add Charlie as VIEWER
    const addViewerRes = await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ email: viewer.email, role: "VIEWER" });
    expect(addViewerRes.status).toBe(201);
  });

  it("MEMBER can create a task", async () => {
    const owner = await createUser("Alice", "alice@test.com");
    const member = await createUser("Bob", "bob@test.com");

    const projectRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ name: "Test Project" });

    const projectId = projectRes.body.project.id;

    await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ email: member.email, role: "MEMBER" });

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${member.accessToken}`)
      .send({
        title: "Fix bug",
        projectId,
        status: "todo",
      });

    expect(res.status).toBe(201);
    expect(res.body.task.title).toBe("Fix bug");
  });

  it("VIEWER cannot create a task", async () => {
    const owner = await createUser("Alice", "alice@test.com");
    const viewer = await createUser("Charlie", "charlie@test.com");

    const projectRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ name: "Test Project" });

    const projectId = projectRes.body.project.id;

    await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ email: viewer.email, role: "VIEWER" });

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${viewer.accessToken}`)
      .send({
        title: "Fix bug",
        projectId,
        status: "todo",
      });

    expect(res.status).toBe(403);
  });

  it("VIEWER cannot update a task", async () => {
    const owner = await createUser("Alice", "alice@test.com");
    const viewer = await createUser("Charlie", "charlie@test.com");

    const projectRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ name: "Test Project" });

    const projectId = projectRes.body.project.id;

    // Owner creates a task
    const taskRes = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ title: "Fix bug", projectId, status: "todo" });

    const taskId = taskRes.body.task.id;

    // Add viewer
    await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ email: viewer.email, role: "VIEWER" });

    // Viewer tries to update
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${viewer.accessToken}`)
      .send({ status: "done" });

    expect(res.status).toBe(403);
  });

  it("VIEWER can still READ tasks", async () => {
    const owner = await createUser("Alice", "alice@test.com");
    const viewer = await createUser("Charlie", "charlie@test.com");

    const projectRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ name: "Test Project" });

    const projectId = projectRes.body.project.id;

    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ title: "Fix bug", projectId, status: "todo" });

    await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ email: viewer.email, role: "VIEWER" });

    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${viewer.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("non-member cannot access project tasks", async () => {
    const owner = await createUser("Alice", "alice@test.com");
    const outsider = await createUser("Eve", "eve@test.com");

    const projectRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ name: "Test Project" });

    const projectId = projectRes.body.project.id;

    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ title: "Fix bug", projectId, status: "todo" });

    // Outsider tries to read tasks
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${outsider.accessToken}`);

    // Outsider sees only their own tasks (which is empty)
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });
});