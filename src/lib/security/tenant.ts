import { prisma } from "@/lib/db";

export async function assertUserOwnsWorkflow(userId: string, workflowId: string) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    select: { id: true, userId: true },
  });

  if (!workflow || workflow.userId !== userId) {
    throw new Error("Forbidden: workflow does not belong to current user");
  }

  return workflow;
}