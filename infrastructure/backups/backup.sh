#!/bin/bash
# HirebridgeHR — Daily backup script
# Add to crontab: 0 2 * * * /home/aman/hirebridgehr/infrastructure/backups/backup.sh

set -e

BACKUP_DIR="${BACKUP_DIR:-/home/aman/backups/hirebridgehr}"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"
mkdir -p "$BACKUP_DIR/db"
mkdir -p "$BACKUP_DIR/uploads"

echo "🔄 Starting backup: $DATE"

# Database
echo "📦 Backing up PostgreSQL..."
docker exec hirebridge_postgres pg_dump -U hirebridge hirebridge | gzip > "$BACKUP_DIR/db/hirebridge_$DATE.sql.gz"

# Uploads (if any)
if [ -d "$HOME/hirebridgehr/apps/api/uploads" ]; then
  echo "📦 Backing up uploads..."
  tar czf "$BACKUP_DIR/uploads/uploads_$DATE.tar.gz" -C "$HOME/hirebridgehr/apps/api" uploads
fi

# Clean old backups
echo "🧹 Cleaning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR/db" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR/uploads" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Optional: off-server backup with rsync
# rsync -avz "$BACKUP_DIR/" user@backup-server:/backups/hirebridgehr/

echo "✅ Backup complete: $BACKUP_DIR"
echo "   DB: $(du -h $BACKUP_DIR/db/hirebridge_$DATE.sql.gz | cut -f1)"
