import dotenv from "dotenv";
dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const NODE_ENV = optionalEnv("NODE_ENV", "development");
export const PORT = Number(optionalEnv("PORT", "5000"));
export const JWT_SECRET = requireEnv("JWT_SECRET");
export const REDIS_URL = optionalEnv("REDIS_URL", "redis://localhost:6379");

// CORS_ORIGIN can be a single origin or a comma-separated list
export const CORS_ORIGINS = optionalEnv("CORS_ORIGIN", "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);