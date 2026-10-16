import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import { redisConnection } from "./lib/redis";
import prisma from "./lib/prisma";
import { emitToUser } from "./lib/socket";
import { initSocket } from "./lib/socket";
import { createServer } from "http";

// Worker ko bhi socket emit karna hai, isliye ek chhota socket server yahan bhi init karte hain
const dummyServer = createServer();
initSocket(dummyServer);
dummyServer.listen(5001, () => console.log("Worker socket relay on port 5001 (internal)"));

const worker = new Worker(
  "notifications",
  async (job) => {
    const { userId, type, message, projectId, taskId } = job.data;

    const notification = await prisma.notification.create({
      data: { userId, type, message, projectId, taskId },
    });
    console.log(`Processing notification job for user ${userId}`);

    emitToUser(userId, "notification:new", notification);
    console.log(`Processed notification job for user ${userId}`);
  },
  { connection: redisConnection }
);

worker.on("failed", (job, err) => {
  console.error(`Notification job ${job?.id} failed:`, err.message);
});

console.log("Notification worker is running...");
