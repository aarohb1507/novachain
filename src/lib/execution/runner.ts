import { ExecutionStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { WorkflowExecutionJob } from "@/lib/queue";
import { createAuditLog } from "@/lib/security/audit-log";

export async function runWorkflowExecution(job: WorkflowExecutionJob) {
  await prisma.execution.update({
    where: { id: job.executionId },
    data: { status: ExecutionStatus.RUNNING },
  });

  try {
    await createAuditLog({
      userId: job.userId,
      workflowId: job.workflowId,
      executionId: job.executionId,
      action: "execution.started",
      resource: "workflow_execution",
      metadata: { triggerType: job.triggerType },
    });

    await prisma.execution.update({
      where: { id: job.executionId },
      data: {
        status: ExecutionStatus.SUCCEEDED,
        result: { message: "Execution placeholder completed" },
        finishedAt: new Date(),
      },
    });

    await createAuditLog({
      userId: job.userId,
      workflowId: job.workflowId,
      executionId: job.executionId,
      action: "execution.succeeded",
      resource: "workflow_execution",
      metadata: { finishedAt: new Date().toISOString() },
    });
  } catch (error) {
    await prisma.execution.update({
      where: { id: job.executionId },
      data: {
        status: ExecutionStatus.FAILED,
        error: error instanceof Error ? error.message : "Unknown execution error",
        finishedAt: new Date(),
      },
    });

    await createAuditLog({
      userId: job.userId,
      workflowId: job.workflowId,
      executionId: job.executionId,
      action: "execution.failed",
      resource: "workflow_execution",
      metadata: {
        reason: error instanceof Error ? error.message : "Unknown execution error",
      },
    });

    throw error;
  }
}