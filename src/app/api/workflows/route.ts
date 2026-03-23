import { WorkflowStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/security/audit-log";

const createWorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  definition: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
  }),
  status: z.nativeEnum(WorkflowStatus).default(WorkflowStatus.DRAFT),
});

function getUserEmail(request: NextRequest) {
  return request.headers.get("x-user-email") ?? "demo@novachain.local";
}

export async function GET(request: NextRequest) {
  const email = getUserEmail(request);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const workflows = await prisma.workflow.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      version: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ workflows });
}

export async function POST(request: NextRequest) {
  const email = getUserEmail(request);
  const body = await request.json();
  const parsed = createWorkflowSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid workflow payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const workflow = await prisma.workflow.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      description: parsed.data.description,
      status: parsed.data.status,
      definition: parsed.data.definition,
    },
    select: {
      id: true,
      name: true,
      status: true,
      version: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await createAuditLog({
    userId: user.id,
    workflowId: workflow.id,
    action: "workflow.created",
    resource: "workflow",
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    userAgent: request.headers.get("user-agent") ?? undefined,
    metadata: { workflowName: workflow.name },
  });

  return NextResponse.json({ workflow }, { status: 201 });
}