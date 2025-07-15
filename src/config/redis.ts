import {Redis} from "ioredis"

export const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

redis.on("error", (err: Error) => {
  console.error("Redis error:", err);
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});