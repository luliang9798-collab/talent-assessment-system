#!/usr/bin/env bash
# ============================================================
# 数据库备份脚本（SQLite 在线热备，使用 .backup 保证一致性）
# 用法：bash backup.sh                # 单次备份
#       crontab -e 添加：0 2 * * * /opt/talent-assessment/deploy/backup.sh
# ============================================================
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DB_PATH="${DB_PATH:-$ROOT_DIR/backend-nodejs/talent_assessment_new.db}"
BACKUP_DIR="$ROOT_DIR/backups"
DATE="$(date +%Y%m%d_%H%M%S)"
KEEP_DAYS=30

mkdir -p "$BACKUP_DIR"

if [ ! -f "$DB_PATH" ]; then
    echo "❌ 数据库文件不存在: $DB_PATH"
    exit 1
fi

BACKUP_FILE="$BACKUP_DIR/talent_assessment_${DATE}.db"

# 使用 sqlite3 的在线备份命令（不阻塞服务）
if command -v sqlite3 >/dev/null 2>&1; then
    sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"
else
    # 降级方案：直接复制（建议在低峰期执行）
    cp "$DB_PATH" "$BACKUP_FILE"
fi

# 压缩
if command -v gzip >/dev/null 2>&1; then
    gzip -f "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"
fi

echo "✅ 备份完成: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"

# 清理旧备份
find "$BACKUP_DIR" -name 'talent_assessment_*.db*' -type f -mtime +$KEEP_DAYS -delete 2>/dev/null || true
echo "🧹 已清理 ${KEEP_DAYS} 天前的旧备份"
