#!/usr/bin/env bash
# ============================================================
# 生产环境启动脚本（手动运行，不依赖 systemd 时使用）
# 用法：bash start.sh  （建议配合 nohup 或 screen 使用）
# ============================================================
set -e

# 定位项目根目录（本脚本位于 deploy/ 下）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

# 加载 .env（若存在）
if [ -f "$ROOT_DIR/.env" ]; then
    set -a
    . "$ROOT_DIR/.env"
    set +a
    echo "📄 已加载 .env 配置"
fi

export PORT="${PORT:-3000}"
export JWT_SECRET="${JWT_SECRET:-change-this-to-a-strong-random-secret-key}"
export DB_PATH="${DB_PATH:-./backend-nodejs/talent_assessment_new.db}"

echo "🚀 启动人才测评系统 (端口 $PORT)..."
echo "   数据库: $DB_PATH"
echo "   按 Ctrl+C 停止"
echo ""

cd "$ROOT_DIR/backend-nodejs"
exec node server-minimal.js
