#!/bin/bash
# HirebridgeHR — Restart Script

PROJECT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT"

echo "🔄 Restarting HirebridgeHR..."
echo ""

# Stop without prompting for Docker
if [ -d "$PROJECT/.pids" ]; then
  for pid_file in "$PROJECT/.pids"/*.pid; do
    if [ -f "$pid_file" ]; then
      OLD_PID=$(cat "$pid_file")
      if ps -p "$OLD_PID" > /dev/null 2>&1; then
        pkill -P "$OLD_PID" 2>/dev/null || true
        kill "$OLD_PID" 2>/dev/null || true
      fi
      rm -f "$pid_file"
    fi
  done
fi

# Kill by port
for port in 4000 5173 5174; do
  PIDS=$(lsof -ti :$port 2>/dev/null || true)
  [ -n "$PIDS" ] && echo "$PIDS" | xargs kill -9 2>/dev/null || true
done

sleep 2

# Start
"$PROJECT/start.sh"
