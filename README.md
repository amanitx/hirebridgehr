# HirebridgeHR

Full-Stack ATS & Job Distribution Platform.

## Quick Start

```bash
npm install
docker compose up -d
cp .env.example .env
cd apps/api && npx prisma migrate dev
npm run db:seed
npm run dev:api
