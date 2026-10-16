import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redisConnection } from "../lib/redis";

/**
 * Strict limiter for auth routes: 10 attempts per 15 minutes per IP.
 * Prevents brute-force on /login and /register.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many attempts. Please try again after 15 minutes.",
  },
  store: new RedisStore({
    sendCommand: (...args: string[]) =>
      redisConnection.call(args[0], ...args.slice(1)) as any,
    prefix: "rl:auth:",
  }),
});

/**
 * General limiter for all other API routes: 100 requests per minute per IP.
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please slow down.",
  },
  store: new RedisStore({
    sendCommand: (...args: string[]) =>
      redisConnection.call(args[0], ...args.slice(1)) as any,
    prefix: "rl:gen:",
  }),
});