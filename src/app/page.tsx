import { WorkflowEditor } from "@/components/workflow/workflow-editor";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-4 py-6 md:px-6">
        <section className="rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/15 dark:bg-black md:p-6">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">NovaChain Workflow Builder</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Build trigger-to-action automations with a node canvas, then execute them through a queued worker engine.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2 text-xs md:grid-cols-3">
            <div className="rounded-lg border border-black/10 bg-zinc-50 px-3 py-2 dark:border-white/15 dark:bg-zinc-950">
              Trigger Nodes: webhook, schedule, inbound events
            </div>
            <div className="rounded-lg border border-black/10 bg-zinc-50 px-3 py-2 dark:border-white/15 dark:bg-zinc-950">
              Action Nodes: HTTP, messaging, task systems
            </div>
            <div className="rounded-lg border border-black/10 bg-zinc-50 px-3 py-2 dark:border-white/15 dark:bg-zinc-950">
              Compliance: audit logs, encryption, rate limits
            </div>
          </div>
        </section>

        <WorkflowEditor />
      </main>
    </div>
  );
}
