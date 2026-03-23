import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

type CreateAuditLogInput = {
  userId?: string;
  workflowId?: string;
  executionId?: string;
  action: string;
  resource: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Prisma.InputJsonValue;
};

export async function createAuditLog(input: CreateAuditLogInput) {
  return prisma.auditLog.create({
    data: {
      userId: input.userId,
      workflowId: input.workflowId,
      executionId: input.executionId,
      action: input.action,
      resource: input.resource,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      metadata: input.metadata,
    },
  });
}