#!/usr/bin/env bash
# ============================================================
# 前端 API 地址修正脚本
# 问题：部分前端页面（dashboard.html、test-*.html）硬编码了
#       http://localhost:3000，部署到内网服务器后无法访问 API。
# 解决：将 http://localhost:3000 替换为空（改为相对路径 /api/...），
#       使请求自动指向当前域名，兼容任意内网地址。
# 用法：bash fix-frontend-api.sh   （仅修改 frontend/*.html）
# ============================================================
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"

if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ 未找到前端目录: $FRONTEND_DIR"
    exit 1
fi

echo "🔧 修正前端 API 地址（移除硬编码 localhost:3000）..."

COUNT=0
# 仅处理 HTML 文件，避免误改 libs/axios.min.js 等库文件
for f in "$FRONTEND_DIR"/*.html; do
    if grep -q "http://localhost:3000" "$f"; then
        # 备份原文件（.bak）
        cp "$f" "$f.bak"
        # 将 http://localhost:3000 替换为空（变成相对路径）
        sed -i 's#http://localhost:3000##g' "$f"
        echo "   ✓ 已修正: $(basename "$f")"
        COUNT=$((COUNT+1))
    fi
done

if [ "$COUNT" -eq 0 ]; then
    echo "✅ 未发现需要修正的硬编码地址（前端已使用相对路径）"
else
    echo "✅ 共修正 $COUNT 个文件（原文件备份为 *.bak）"
    echo "💡 如需还原：将 .bak 文件改回 .html 即可"
fi
