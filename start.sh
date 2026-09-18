#!/bin/bash
# ==========================================
# HirebridgeHR — Full Stack Startup Script
# Starts: Docker (Postgres + Redis) + API + Web + Admin
# ==========================================

set -e

PROJECT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT"

LOG_DIR="$PROJECT/.logs"
PID_DIR="$PROJECT/.pids"
mkdir -p "$LOG_DIR" "$PID_DIR"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🚀 HirebridgeHR — Starting Full Stack${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ---------- 1. DOCKER ----------
echo -e "${YELLOW}[1/4]${NC} Starting Docker containers (Postgres + Redis)..."

if ! command -v docker &> /dev/null; then
  echo -e "${RED}❌ Docker not installed${NC}"
  exit 1
fi

docker compose up -d postgres redis > /dev/null 2>&1

# Wait for Postgres to be healthy
echo -n "      Waiting for Postgres to be ready"
for i in {1..30}; do
  if docker exec hirebridge_postgres pg_isready -U hirebridge -d hirebridge > /dev/null 2>&1; then
    echo ""
    echo -e "      ${GREEN}✓${NC} Postgres ready"
    break
  fi
  echo -n "."
  sleep 1
done

echo -e "      ${GREEN}✓${NC} Redis ready"

# ---------- 2. CHECK NODE_MODULES ----------
if [ ! -d "node_modules" ]; then
  echo ""
  echo -e "${YELLOW}[2/4]${NC} Installing dependencies (first run)..."
  npm install
else
  echo ""
  echo -e "${YELLOW}[2/4]${NC} Dependencies already installed"
fi

# Check sub-apps node_modules
if [ ! -d "apps/web/node_modules" ]; then
  echo "      Installing web dependencies..."
  (cd apps/web && npm install)
fi

if [ ! -d "apps/admin/node_modules" ]; then
  echo "      Installing admin dependencies..."
  (cd apps/admin && npm install)
fi

# ---------- 3. CHECK DATABASE ----------
echo ""
echo -e "${YELLOW}[3/4]${NC} Checking database..."

if [ ! -f "apps/api/.env" ]; then
  echo "      Creating apps/api/.env from example..."
  cp apps/api/.env.example apps/api/.env 2>/dev/null || cp .env.example apps/api/.env
fi

# Check if migrations exist
if [ ! -d "apps/api/prisma/migrations" ] || [ -z "$(ls -A apps/api/prisma/migrations 2>/dev/null)" ]; then
  echo "      Running first-time migration..."
  (cd apps/api && npx prisma migrate dev --name init > /dev/null 2>&1)
  (cd apps/api && npx tsx prisma/seed.ts > /dev/null 2>&1)
  echo -e "      ${GREEN}✓${NC} Database initialized + seeded"
else
  (cd apps/api && npx prisma generate > /dev/null 2>&1)
  echo -e "      ${GREEN}✓${NC} Prisma client ready"
fi

# ---------- 4. START SERVICES ----------
echo ""
echo -e "${YELLOW}[4/4]${NC} Starting application services..."

# Kill any existing instances
for pid_file in "$PID_DIR"/*.pid; do
  if [ -f "$pid_file" ]; then
    OLD_PID=$(cat "$pid_file")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
      kill "$OLD_PID" 2>/dev/null || true
    fi
    rm -f "$pid_file"
  fi
done

# ---------- API ----------
cd "$PROJECT"
nohup npm run dev:api > "$LOG_DIR/api.log" 2>&1 &
echo $! > "$PID_DIR/api.pid"
echo -e "      ${GREEN}✓${NC} API starting (PID: $(cat $PID_DIR/api.pid))"

# ---------- WEB ----------
nohup npm run dev:web > "$LOG_DIR/web.log" 2>&1 &
echo $! > "$PID_DIR/web.pid"
echo -e "      ${GREEN}✓${NC} Web starting (PID: $(cat $PID_DIR/web.pid))"

# ---------- ADMIN ----------
nohup npm run dev:admin > "$LOG_DIR/admin.log" 2>&1 &
echo $! > "$PID_DIR/admin.pid"
echo -e "      ${GREEN}✓${NC} Admin starting (PID: $(cat $PID_DIR/admin.pid))"

# ---------- WAIT & VERIFY ----------
echo ""
echo -e "${YELLOW}Waiting for services to come online...${NC}"
sleep 8

# Check API
for i in {1..20}; do
  if curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
    echo -e "      ${GREEN}✓${NC} API is up → http://localhost:4000/api"
    break
  fi
  sleep 1
done

# Check Web
for i in {1..15}; do
  if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "      ${GREEN}✓${NC} Web is up → http://localhost:5173"
    break
  fi
  sleep 1
done

# Check Admin
for i in {1..15}; do
  if curl -s http://localhost:5174 > /dev/null 2>&1; then
    echo -e "      ${GREEN}✓${NC} Admin is up → http://localhost:5174"
    break
  fi
  sleep 1
done

# ---------- SUMMARY ----------
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  🎉 HirebridgeHR is running!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${GREEN}▸${NC} Customer App:  ${BLUE}http://localhost:5173${NC}"
echo -e "  ${GREEN}▸${NC} Admin Panel:   ${BLUE}http://localhost:5174${NC}"
echo -e "  ${GREEN}▸${NC} API:           ${BLUE}http://localhost:4000/api${NC}"
echo -e "  ${GREEN}▸${NC} Health:        ${BLUE}http://localhost:4000/api/health${NC}"
echo ""
echo -e "  ${YELLOW}Login Credentials:${NC}"
echo -e "    Customer:  owner@democorp.com / Owner@12345"
echo -e "    Admin:     admin@hirebridgehr.com / ChangeMe@12345"
echo ""
echo -e "  ${YELLOW}Logs:${NC}      $LOG_DIR/"
echo -e "  ${YELLOW}Stop:${NC}      ./stop.sh"
echo -e "  ${YELLOW}Restart:${NC}   ./restart.sh"
echo ""
