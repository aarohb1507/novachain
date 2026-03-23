import { ConnectionOptions, Queue } from "bullmq";

export const workflowExecutionQueueName = "workflow-executions";

export type WorkflowExecutionJob = {
  workflowId: string;
  executionId: string;
  userId: string;
  triggerType: string;
  payload?: unknown;
};

let executionQueue: Queue | null = null;

function getRedisConnectionOptions(): ConnectionOptions {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is required to use BullMQ queues");
  }

  const redisUrl = new URL(process.env.REDIS_URL);
  const db = redisUrl.pathname.replace("/", "");

  return {
    host: redisUrl.hostname,
    port: Number(redisUrl.port || 6379),
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
    db: db ? Number(db) : 0,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: redisUrl.protocol === "rediss:" ? {} : undefined,
  };
}

function getExecutionQueue() {
  if (!executionQueue) {
    executionQueue = new Queue(workflowExecutionQueueName, {
      connection: getRedisConnectionOptions(),
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: 100,
        removeOnFail: 200,
        backoff: {
          type: "exponential",
          delay: 2_000,
        },
      },
    });
  }

  return executionQueue;
}

export async function enqueueWorkflowExecution(job: WorkflowExecutionJob) {
  return getExecutionQueue().add("execute-workflow", job, {
    jobId: `${job.executionId}`,
  });
}