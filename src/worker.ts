import { ConnectionOptions, QueueEvents, Worker } from "bullmq";

import { runWorkflowExecution } from "@/lib/execution/runner";
import { workflowExecutionQueueName, WorkflowExecutionJob } from "@/lib/queue";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is required to run the worker");
}

const redisUrl = new URL(process.env.REDIS_URL);
const db = redisUrl.pathname.replace("/", "");
const connection: ConnectionOptions = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379),
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined,
  db: db ? Number(db) : 0,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: redisUrl.protocol === "rediss:" ? {} : undefined,
};

const worker = new Worker<WorkflowExecutionJob>(
  workflowExecutionQueueName,
  async (job) => {
    await runWorkflowExecution(job.data);
  },
  { connection },
);

const queueEvents = new QueueEvents(workflowExecutionQueueName, { connection });

queueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`Job ${jobId} failed: ${failedReason}`);
});

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id ?? "unknown"} failed`, error);
});

console.log("Workflow worker started");