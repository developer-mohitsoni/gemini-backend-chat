import { Queue, Worker } from "bullmq";
import { redis } from "../services/redisService.js";
import { defaultQueueConfig } from "../config/queue.js";
import { getGeminiReply } from "../services/geminiService.js";
import prisma from "../DB/db.config.js";

export const messageQueueName = "gemini-message-queue";
export const messageQueue = new Queue(messageQueueName, {
  connection: redis,
  defaultJobOptions: defaultQueueConfig
})

export const handler = new Worker(messageQueueName, async (job)=>{
  const {messageId, content} = job.data;

  const aiReply = await getGeminiReply(content);

  console.log(`AI Reply for message ${messageId}: ${aiReply}`);

  await prisma.message.update({
    where: { id: messageId },
    data: { response: aiReply }
  });

  console.log(`✅ Processed message ${messageId}`);
}, {
  connection: redis,
  
})

handler.on("completed", (job) => {
	console.log(`The job ${job.id} is completed.`); //
});
handler.on("failed", (job) => {
	console.log(`The job ${job?.id} is failed.`);
});
