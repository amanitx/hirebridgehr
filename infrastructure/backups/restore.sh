#!/bin/bash
# HirebridgeHR — Restore from backup
# Usage: ./restore.sh /path/to/backup.sql.gz

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 /path/to/backup.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ File not found: $BACKUP_FILE"
  exit 1
fi

echo "⚠️  WARNING: This will DROP and recreate the hirebridge database."
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Cancelled."
  exit 0
fi

echo "🔄 Restoring from $BACKUP_FILE..."

# Drop and recreate
docker exec hirebridge_postgres psql -U hirebridge -d postgres -c "DROP DATABASE IF EXISTS hirebridge;"
docker exec hirebridge_postgres psql -U hirebridge -d postgres -c "CREATE DATABASE hirebridge;"

# Restore
gunzip -c "$BACKUP_FILE" | docker exec -i hirebridge_postgres psql -U hirebridge -d hirebridge

echo "✅ Restore complete."
echo "   Verify: docker exec hirebridge_postgres psql -U hirebridge -d hirebridge -c '\\dt'"
