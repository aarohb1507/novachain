# NovaChain — Dynamic Workflow Automation Builder

Compliance-first prototype of a visual workflow automation platform inspired by Zapier and n8n.

## What We Are Building

NovaChain lets users create automations on a node canvas:

- Trigger nodes: webhook, schedule, inbound events
- Action nodes: HTTP calls, messaging, productivity APIs
- Logic nodes: if/else, delay, branching

Core runtime behavior:

1. User designs workflow graph in the visual editor.
2. Graph is persisted per user in PostgreSQL via Prisma.
3. Trigger creates an execution record and queues a job in BullMQ.
4. Worker consumes queue jobs and executes node-by-node.
5. Audit logs capture important security/compliance events.

## Stack (Best-Fit for Your Internship Scope)

- Frontend: Next.js App Router + TypeScript + Tailwind + React Flow
- Backend: Next.js Route Handlers + Zod validation
- Database: PostgreSQL + Prisma ORM
- Queue/Async: BullMQ + Redis
- Security baseline: AES-256-GCM credential encryption, audit logs, basic rate limiting, tenant ownership checks

## Compliance Audit Baseline

Implemented in scaffold:

- Data isolation: user-scoped workflow queries
- Auditability: centralized audit log writes
- Credential security: encrypted secret helpers
- Abuse protection: webhook rate limiting
- Reliability: durable queue-backed execution

Still required before final internship submission:

- Replace header-based user mock with real authentication and RBAC
- Move rate limiting to Redis-backed distributed policy
- Add key rotation strategy and managed secret store
- Add full execution trace logging and immutable retention policy
- Add integration-level permission scopes and revocation controls

## Project Structure

- `src/components/workflow`: visual editor components
- `src/app/api`: API endpoints for workflows/webhooks/health
- `src/lib/security`: encryption, audit, rate-limit, tenant helpers
- `src/lib/execution`: queue job runner logic
- `prisma/schema.prisma`: data model for users/workflows/executions/credentials/audit logs

## Setup

1. Copy environment values:

```bash
cp .env.example .env
```

2. Set `DATABASE_URL`, `REDIS_URL`, and a 32-byte base64 `ENCRYPTION_KEY`.

3. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

4. Start app and worker in separate terminals:

```bash
npm run dev
npm run worker
```

## Available Scripts

- `npm run dev`: start Next.js dev server
- `npm run worker`: start BullMQ worker
- `npm run lint`: run ESLint
- `npm run prisma:generate`: generate Prisma client
- `npm run prisma:migrate`: run local Prisma migration
- `npm run prisma:deploy`: run production migrations
- `npm run prisma:studio`: open Prisma Studio
