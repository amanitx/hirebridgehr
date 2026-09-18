#!/bin/bash
# ==========================================
# HirebridgeHR — Stop Script
# Stops: API + Web + Admin (Docker optional)
# ==========================================

PROJECT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT"

PID_DIR="$PROJECT/.pids"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}🛑 Stopping HirebridgeHR services...${NC}"
echo ""

# ---------- STOP SERVICES ----------
if [ -d "$PID_DIR" ]; then
  for pid_file in "$PID_DIR"/*.pid; do
    if [ -f "$pid_file" ]; then
      SERVICE=$(basename "$pid_file" .pid)
      OLD_PID=$(cat "$pid_file")

      if ps -p "$OLD_PID" > /dev/null 2>&1; then
        # Kill the process group (npm spawns children)
        pkill -P "$OLD_PID" 2>/dev/null || true
        kill "$OLD_PID" 2>/dev/null || true
        echo -e "  ${GREEN}✓${NC} Stopped $SERVICE (PID: $OLD_PID)"
      fi
      rm -f "$pid_file"
    fi
  done
fi

# Fallback: kill by port
for port in 4000 5173 5174; do
  PIDS=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
  fi
done

# ---------- DOCKER ----------
read -p "Stop Docker containers too? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  docker compose down
  echo -e "  ${GREEN}✓${NC} Docker containers stopped"
else
  echo -e "  ${YELLOW}i${NC} Docker containers still running"
fi

echo ""
echo -e "${GREEN}✅ All services stopped${NC}"
echo ""
