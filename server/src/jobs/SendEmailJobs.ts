import { Queue, Worker } from "bullmq";
import { redis } from "../services/redisService.js";
import { defaultQueueConfig } from "../config/queue.js";

export const messageQueue = "gemini-message-queue";
export const emailQueue = new Queue(messageQueue, {
  connection: redis,
  defaultJobOptions: defaultQueueConfig
})