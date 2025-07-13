import { Queue, Worker } from "bullmq";
import { redis } from "../services/redisService.js";
import { defaultQueueConfig } from "../config/queue.js";

export const messageQueueName = "gemini-message-queue";
export const messageQueue = new Queue(messageQueueName, {
  connection: redis,
  defaultJobOptions: defaultQueueConfig
})

export const handler = new Worker(messageQueueName, async (job)=>{
  console.log(`Processing job ${job.id} in ${messageQueueName}`);
}, {
  connection: redis,
  
})

handler.on("completed", (job) => {
	console.log(`The job ${job.id} is completed.`); //
});
handler.on("failed", (job) => {
	console.log(`The job ${job?.id} is failed.`);
});
