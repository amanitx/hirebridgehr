# HirebridgeHR

**Full-stack ATS & managed job distribution platform.**

Recruitment SaaS for companies and agencies — create jobs once, let HirebridgeHR handle distribution, and manage the entire hiring pipeline in one place.

---

## 🎯 What It Does

- **Applicant Tracking System (ATS)** — candidates, applications, Kanban pipeline
- **Job Management** — create, publish, close, distribute
- **Managed Job Distribution** — customer clicks Publish → HirebridgeHR admin posts to LinkedIn → customer sees Published
- **Multi-Tenancy** — every organization's data is isolated at the backend
- **RBAC** — 6 roles: Owner, Admin, Recruiter, Hiring Manager, Interviewer, Viewer
- **Interviews & Feedback** — schedule, reschedule, cancel, submit structured feedback
- **Notifications** — in-app bell + dedicated page
- **Analytics** — pipeline conversion, sources, activity over time
- **Activity Log** — full audit trail of every action

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS + TypeScript |
| Database | PostgreSQL 16 |
| ORM | Prisma 6 |
| Auth | JWT (access + refresh) |
| Customer App | React 18 + Vite + TypeScript |
| Admin Panel | React 18 + Vite + TypeScript |
| UI | Tailwind CSS + shadcn-style components |
| State | Zustand (auth) + TanStack Query (data) |
| Email | Nodemailer + SMTP |
| Deploy | Docker Compose + Nginx + Let's Encrypt |

---

## 📁 Project Structure

```
hirebridgehr/
├── apps/
│   ├── api/              NestJS backend (REST API)
│   ├── web/              Customer app (React)
│   └── admin/            HirebridgeHR admin panel (React)
├── packages/             Shared code (future)
├── infrastructure/
│   ├── docker/           Dockerfiles
│   ├── nginx/            Production nginx config
│   └── backups/          Backup + restore scripts
├── docs/                 Detailed documentation
├── docker-compose.yml    Dev + prod services
└── README.md             ← You are here
```

**Domains (production):**
- `hirebridgehr.com` — marketing site
- `app.hirebridgehr.com` — customer app
- `admin.hirebridgehr.com` — internal admin
- `api.hirebridgehr.com` — backend API

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 20+
- Docker + Docker Compose
- npm 10+

### 1. Clone

```bash
git clone https://github.com/amanitx/hirebridgehr.git
cd hirebridgehr
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start database + Redis

```bash
docker compose up -d postgres redis
docker ps   # confirm both containers are "Up"
```

### 4. Setup environment

```bash
cp .env.example .env
# Edit .env — set JWT secrets, SMTP creds (optional for dev)
```

### 5. Migrate database

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
cd ../..
```

### 6. Start all services (3 terminals)

**Terminal 1 — Backend API:**
```bash
npm run dev:api
# → http://localhost:4000/api
```

**Terminal 2 — Customer app:**
```bash
npm run dev:web
# → http://localhost:5173
```

**Terminal 3 — Admin panel:**
```bash
npm run dev:admin
# → http://localhost:5174
```

---

## 🔑 Default Credentials

| Role | URL | Email | Password |
|------|-----|-------|----------|
| **Super Admin** (HirebridgeHR) | http://localhost:5174 | `admin@hirebridgehr.com` | `ChangeMe@12345` |
| **Demo Owner** (customer) | http://localhost:5173 | `owner@democorp.com` | `Owner@12345` |

---

## 🔄 Core Workflow — Managed LinkedIn Distribution

Ye HirebridgeHR ka **core feature** hai.

```
Customer creates a job
        ↓
Customer clicks "Publish"
        ↓
Distribution Service creates 2 requests:
  ├── Career Page  →  auto-published
  └── LinkedIn     →  PENDING_ADMIN_PUBLICATION
        ↓
HirebridgeHR Admin sees it in Publishing Queue
        ↓
Admin manually posts on LinkedIn
        ↓
Admin clicks "Mark Published"
        ↓
Customer sees job status = PUBLISHED
```

**Direct LinkedIn API integration is NOT part of MVP.** The architecture is abstracted (`JobBoardConnector` interface) to allow future integration with LinkedIn, Indeed, Naukri, etc.

---

## 🏛️ Architecture Highlights

### Multi-Tenancy (Enforced at Backend)

Every organization-owned entity has `organizationId`. All queries are scoped via `TenantGuard`, which injects the organization from JWT or the `x-organization-id` header.

**Cross-org access is blocked at the API level** — verified in tests.

### RBAC (Role-Based Access Control)

Roles: `OWNER`, `ADMIN`, `RECRUITER`, `HIRING_MANAGER`, `INTERVIEWER`, `VIEWER`

`RolesGuard` enforces role requirements on protected endpoints.

### Distribution Abstraction

```typescript
interface JobBoardConnector {
  platform: string;
  publishJob(payload): Promise<PublishResult>;
  updateJob(id, payload): Promise<void>;
  closeJob(id): Promise<void>;
  getStatus(id): Promise<ConnectorStatus>;
}
```

**MVP implementations:**
- `CareerPageConnector` — auto-publishes
- `LinkedInConnector` — stub for managed/manual workflow

**Future:** Real `LinkedInConnector`, `IndeedConnector`, `NaukriConnector`, etc.

### Database — Core Entities (18 tables)

```
Organization (tenant)
 ├── OrganizationUser (N:M with User)
 ├── Client (agency mode)
 ├── Job
 │    ├── Application ── Candidate
 │    ├── JobDistribution
 │    └── Interview ── InterviewFeedback
 ├── Candidate ── CandidateDocument
 ├── Notification
 ├── ActivityLog
 └── Subscription ── Plan
```

Full ERD: see `docs/ERD.md`.

---

## 📡 API Overview

Base URL: `http://localhost:4000/api`

All responses:
```json
{ "success": true, "data": ..., "timestamp": "ISO" }
```
Errors:
```json
{ "success": false, "statusCode": 400, "message": "...", "path": "..." }
```

### Endpoint Groups

| Group | Prefix | Key Endpoints |
|-------|--------|---------------|
| Auth | `/auth` | signup, login, refresh, verify-email, forgot-password, reset-password, me |
| Organizations | `/organizations` | me, me/members, invite, role, remove |
| Onboarding | `/onboarding` | complete |
| Users | `/users` | me (GET, PATCH) |
| Jobs | `/jobs` | CRUD, publish, close, distributions, pipeline |
| Candidates | `/candidates` | CRUD, assign |
| Applications | `/applications` | create, list, status, reject, withdraw |
| Interviews | `/interviews` | schedule, list, status, feedback |
| Notifications | `/notifications` | list, unread-count, mark-read |
| Analytics | `/analytics` | overview, pipeline, sources, activity |
| Activity | `/activity` | list |
| **Admin** | `/admin` | publishing-queue, distributions, mark-published, reject, organizations, analytics |
| Health | `/health`, `/version` | public |

**Full API reference:** see `docs/API.md`.

---

## 🗄️ Database Commands

```bash
npm run db:migrate    # Run Prisma migrations
npm run db:generate   # Generate Prisma Client
npm run db:seed       # Seed DB (super admin + demo org)
npm run db:studio     # Open Prisma Studio (GUI)
```

---

## 🐳 Docker

**Dev (DB only):**
```bash
docker compose up -d postgres redis
```

**Production (full stack):**
```bash
docker compose --profile production up -d api
```

**Logs:**
```bash
docker compose logs -f api
```

---

## 🛡️ Security

- **Password hashing** — bcrypt (12 rounds)
- **JWT** — access (15m) + refresh (7d) tokens
- **RBAC** — backend-enforced on every protected endpoint
- **Multi-tenancy** — backend-enforced, cross-org access blocked
- **Rate limiting** — ThrottlerModule (100 req/min default)
- **Security headers** — Helmet
- **CORS** — restricted to allowed origins
- **Input validation** — class-validator + whitelist
- **Secrets** — never committed; `.env` gitignored

---

## 🧪 Testing the MVP

Three scenarios define "MVP Complete":

### Scenario 1 — Job Publishing Flow
1. Customer signs up → onboarding → dashboard
2. Creates a job → clicks Publish
3. Admin receives request in Publishing Queue
4. Admin marks Published
5. Customer sees job as PUBLISHED

### Scenario 2 — Candidate Flow
1. Candidate application arrives
2. Candidate record created + linked to job
3. Admin reviews → assigns to client
4. Client moves candidate through pipeline
5. Activity log records every move

### Scenario 3 — Multi-Tenancy
1. Client A cannot see Client B's candidates/jobs/data
2. Backend returns 403 Forbidden on cross-org access

---

## 📚 Documentation

| Doc | Purpose |
|-----|---------|
| [Architecture](docs/ARCHITECTURE.md) | System design, modules, abstractions |
| [ERD](docs/ERD.md) | Database schema and relationships |
| [API](docs/API.md) | Full endpoint reference |
| [Deployment](docs/DEPLOYMENT.md) | VPS setup, Nginx, SSL, backups |
| [Backup & Restore](docs/BACKUP_RESTORE.md) | Backup strategy and recovery |
| [Demo Guide](docs/DEMO.md) | 15-min walkthrough for demos |

---

## 🚢 Deployment (Production)

**Target:** Contabo VPS + Ubuntu 22.04+

### 1. Server setup

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx
sudo usermod -aG docker $USER
```

### 2. Clone + env

```bash
cd ~
git clone https://github.com/amanitx/hirebridgehr.git
cd hirebridgehr
cp .env.example .env
nano .env   # set production secrets
```

### 3. Database

```bash
docker compose up -d postgres redis
cd apps/api
npx prisma migrate deploy
npx tsx prisma/seed.ts
cd ../..
```

### 4. Build + run API

```bash
docker compose --profile production up -d api
docker compose logs -f api
```

### 5. Build frontends

```bash
cd apps/web && npm install && npm run build
cd ../admin && npm install && npm run build
# Serve dist/ via Nginx
```

### 6. Nginx + SSL

```bash
sudo cp infrastructure/nginx/nginx.conf /etc/nginx/sites-available/hirebridgehr
sudo ln -s /etc/nginx/sites-available/hirebridgehr /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d hirebridgehr.com -d www.hirebridgehr.com \
  -d app.hirebridgehr.com -d admin.hirebridgehr.com -d api.hirebridgehr.com
```

### 7. Backups (daily cron)

```bash
crontab -e
# Add:
0 2 * * * /home/aman/hirebridgehr/infrastructure/backups/backup.sh >> /var/log/hirebridgehr-backup.log 2>&1
```

**Full deployment guide:** see `docs/DEPLOYMENT.md`.

---

## 📊 What's Built (MVP Complete ✅)

| Feature | Status |
|---------|--------|
| Auth (signup, login, verify, reset) | ✅ |
| Organizations + RBAC + multi-tenancy | ✅ |
| Onboarding flow (backend ready) | ✅ |
| Dashboard with live stats | ✅ |
| Jobs (list, create, detail, publish, close) | ✅ |
| Managed distribution (Career Page + LinkedIn) | ✅ |
| Publishing Queue (admin) | ✅ |
| Candidates (list, create, detail, assign) | ✅ |
| Applications + Kanban pipeline | ✅ |
| Interviews + structured feedback | ✅ |
| Notifications (in-app) | ✅ |
| Analytics (overview, pipeline, sources) | ✅ |
| Activity log (full audit) | ✅ |
| Organizations view (admin) | ✅ |
| Platform analytics (admin) | ✅ |
| Health check + version | ✅ |
| Docker + Nginx + Backups | ✅ |

---

## 🛣️ Roadmap

### V1.5 — Enhancements
- Resume parsing
- Duplicate candidate detection
- Email automation (candidate intake)
- Career pages (public, per org)
- Agency client portal

### V2 — AI + Advanced
- AI candidate matching (job ↔ candidate score)
- AI job description builder
- Advanced analytics (time-to-hire, source quality, cost per hire)
- Candidate portal

### V3 — Integrations
- Real LinkedIn API
- Indeed, Naukri, Google Jobs
- Custom job board connectors

### V4 — Enterprise
- SSO (SAML, OIDC)
- SCIM provisioning
- Advanced RBAC
- Public API + webhooks
- Compliance (SOC2, GDPR)
- SLA

---

## 🚫 What's NOT in MVP (Backlog)

Deliberately out of scope to keep MVP focused:

- ❌ Direct LinkedIn API integration
- ❌ 20+ job board integrations
- ❌ Mobile app
- ❌ Advanced AI recruiter
- ❌ WhatsApp automation
- ❌ Payroll, employee management
- ❌ Complex assessments
- ❌ Video interviewing platform
- ❌ Predictive analytics
- ❌ Enterprise SSO
- ❌ Complex billing

Interfaces/abstractions are in place; features will be added incrementally.

---

## 🛠️ Useful Commands

```bash
# Dev
npm run dev:api            # Backend with watch
npm run dev:web            # Customer app
npm run dev:admin          # Admin panel

# Database
npm run db:migrate         # Run migrations
npm run db:generate        # Regenerate Prisma client
npm run db:seed            # Seed data
npm run db:studio          # Prisma Studio GUI

# Docker
npm run docker:up          # Start dev services
npm run docker:down        # Stop dev services

# Production
docker compose --profile production up -d api
```

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| `Can't reach database server` | `docker ps` → ensure `hirebridge_postgres` is Up |
| Port 5432 in use | Change Docker port to 5433 in `docker-compose.yml` and update `DATABASE_URL` |
| `Environment variable not found: DATABASE_URL` | Copy `.env.example` to `.env` in `apps/api/` |
| Login fails with valid creds | Check backend terminal for errors; confirm DB seeded |
| Frontend blank page | Open browser console (F12), check for errors |
| CORS error | Ensure API is running on port 4000; check CORS config |

---

## 📄 License

Proprietary — © HirebridgeHR. All rights reserved.

---

## 🙏 Credits

Built with NestJS, Prisma, React, and Vite.
Design language: **Liquid Glass** — premium, minimal, professional.