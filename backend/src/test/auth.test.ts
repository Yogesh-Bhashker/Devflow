// IMPORTANT: mock socket BEFORE importing the app
import "./mocks";

import { describe, it, expect } from "vitest";
import request from "supertest";
import { createTestApp } from "./app";

const app = createTestApp();

describe("POST /api/auth/register", () => {
  it("registers a new user with valid data", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Alice",
      email: "alice@test.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("alice@test.com");
    expect(res.body.user.name).toBe("Alice");
    expect(res.body.user.password).toBeUndefined(); // password kabhi return nahi hona chahiye
  });

  it("rejects registration with a weak password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Bob",
      email: "bob@test.com",
      password: "123", // too short
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(res.body.errors[0].message).toContain("at least 8 characters");
  });

  it("rejects registration with an invalid email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Charlie",
      email: "not-an-email",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(res.body.errors[0].message).toContain("Invalid email");
  });

  it("rejects duplicate email", async () => {
    // First register
    await request(app).post("/api/auth/register").send({
      name: "Alice",
      email: "alice@test.com",
      password: "password123",
    });

    // Try again with same email
    const res = await request(app).post("/api/auth/register").send({
      name: "Alice 2",
      email: "alice@test.com",
      password: "password456",
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("already in use");
  });
});

describe("POST /api/auth/login", () => {
  it("logs in with valid credentials and sets a refresh cookie", async () => {
    // Register first
    await request(app).post("/api/auth/register").send({
      name: "Alice",
      email: "alice@test.com",
      password: "password123",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "alice@test.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe("alice@test.com");
    // Cookie should be set
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.headers["set-cookie"]?.[0]).toContain("refreshToken=");
  });

  it("rejects login with wrong password", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Alice",
      email: "alice@test.com",
      password: "password123",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "alice@test.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("rejects login with non-existent user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@test.com",
      password: "password123",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("rejects login with missing fields", async () => {
    const res = await request(app).post("/api/auth/login").send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
  });
});