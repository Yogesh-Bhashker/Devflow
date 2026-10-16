import { Redis } from "ioredis";
import { REDIS_URL } from "../config/env";

export const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});