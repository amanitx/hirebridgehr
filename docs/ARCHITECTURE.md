# HirebridgeHR — Architecture

## Overview

HirebridgeHR is a multi-tenant recruitment SaaS platform built as a monorepo.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend (customer) | React + Vite + TypeScript + Tailwind + shadcn/ui |
| Frontend (admin) | Same stack, separate app |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL 16 |
| ORM | Prisma 6 |
| Auth | JWT (access + refresh) |
| Email | Nodemailer + SMTP |
| Automation | n8n (future) |
| Deploy | Docker + Docker Compose + Nginx + Contabo VPS |

## Domains

- `hirebridgehr.com` — marketing site
- `app.hirebridgehr.com` — customer app
- `admin.hirebridgehr.com` — internal admin
- `api.hirebridgehr.com` — backend API

## Multi-Tenancy

Every organization-owned entity has `organizationId`. All queries are scoped
by organization at the service layer. `TenantGuard` injects `organizationId`
from the JWT's organization membership or the `x-organization-id` header.

Cross-org access is prevented at the backend — verified in tests.

## Modules

| Module | Purpose |
|--------|---------|
| Auth | Signup, login, JWT, email verify, password reset |
| Organizations | Org CRUD, member invite, role management, onboarding |
| Users | Profile |
| Jobs | CRUD, publish, close |
| Distribution | Job distribution to LinkedIn (managed) + Career Page (auto) |
| Candidates | CRUD, assign, search |
| Applications | CRUD, status transitions, pipeline |
| Interviews | Schedule, reschedule, cancel, feedback |
| Notifications | In-app notifications |
| Activity | Audit log |
| Analytics | Dashboard metrics |
| Health | Health check, version |

## Distribution Abstraction

The `JobBoardConnector` interface abstracts publishing to external platforms:

```typescript
interface JobBoardConnector {
  platform: string;
  publishJob(payload): Promise<PublishResult>;
  updateJob(externalJobId, payload): Promise<void>;
  closeJob(externalJobId): Promise<void>;
  getStatus(externalJobId): Promise<ConnectorStatus>;
}
