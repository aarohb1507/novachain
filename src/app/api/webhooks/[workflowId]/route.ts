import { ExecutionStatus, WorkflowStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { enqueueWorkflowExecution } from "@/lib/queue";
import { createAuditLog } from "@/lib/security/audit-log";
import { isRateLimited } from "@/lib/security/rate-limit";

type RouteContext = {
  params: Promise<{ workflowId: string }>;
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { workflowId } = await params;
  const ipAddress = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const userAgent = request.headers.get("user-agent") ?? undefined;

  if (isRateLimited(`webhook:${workflowId}:${ipAddress}`, 30, 60_000)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    select: { id: true, userId: true, status: true },
  });

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  if (workflow.status !== WorkflowStatus.ACTIVE) {
    return NextResponse.json({ error: "Workflow is not active" }, { status: 409 });
  }

  const payload = await request.json().catch(() => ({}));

  const execution = await prisma.execution.create({
    data: {
      workflowId: workflow.id,
      userId: workflow.userId,
      triggerType: "webhook",
      status: ExecutionStatus.QUEUED,
      payload,
    },
    select: { id: true },
  });

  await enqueueWorkflowExecution({
    workflowId: workflow.id,
    executionId: execution.id,
    userId: workflow.userId,
    triggerType: "webhook",
    payload,
  });

  await createAuditLog({
    userId: workflow.userId,
    workflowId: workflow.id,
    executionId: execution.id,
    action: "execution.queued",
    resource: "workflow_execution",
    ipAddress,
    userAgent,
    metadata: { triggerType: "webhook" },
  });

  return NextResponse.json(
    {
      message: "Workflow execution queued",
      executionId: execution.id,
    },
    { status: 202 },
  );
}