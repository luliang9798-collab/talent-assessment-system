#!/usr/bin/env bash
# ============================================================
# 人才测评系统 - 一键安装脚本（适用于公司内部 Linux 服务器）
# 用法：sudo bash install.sh
# 适用系统：Ubuntu 20.04+/CentOS 7+/Debian 10+（x86_64）
# ============================================================
set -e

APP_NAME="talent-assessment"
INSTALL_DIR="/opt/${APP_NAME}"
CURRENT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=============================================="
echo "  人才测评系统 部署安装脚本"
echo "=============================================="

# 1. 检查是否以 root 运行
if [ "$(id -u)" -ne 0 ]; then
    echo "❌ 请使用 root 或 sudo 运行此脚本"
    exit 1
fi

# 2. 检查 Node.js
if ! command -v node >/dev/null 2>&1; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js 18 及以上版本"
    echo "   参考：https://github.com/nodesource/distributions"
    exit 1
fi
NODE_VER=$(node -v | cut -d. -f1 | tr -d 'v')
if [ "$NODE_VER" -lt 18 ]; then
    echo "❌ Node.js 版本过低（当前 $(node -v)），需要 >= 18"
    exit 1
fi
echo "✅ Node.js 版本: $(node -v)"

# 3. 复制项目到安装目录
echo "📁 部署目录: $INSTALL_DIR"
if [ -d "$INSTALL_DIR" ]; then
    echo "⚠️  $INSTALL_DIR 已存在，将保留现有数据库与配置"
else
    mkdir -p "$INSTALL_DIR"
fi
# 仅复制必要文件（排除 node_modules / 开发数据库 / 日志 / git）
# 优先使用 rsync（若存在），否则回退到 cp
if command -v rsync >/dev/null 2>&1; then
    rsync -a --exclude='node_modules' --exclude='*.db' --exclude='*.db-journal' \
          --exclude='logs' --exclude='.git' --exclude='db-init/_test.db' \
          "$CURRENT_DIR/" "$INSTALL_DIR/"
else
    cp -r "$CURRENT_DIR/." "$INSTALL_DIR/"
    # 清理不应部署的产物
    rm -rf "$INSTALL_DIR/node_modules" "$INSTALL_DIR/backend-nodejs/node_modules"
    rm -f "$INSTALL_DIR/backend-nodejs/"*.db "$INSTALL_DIR/backend-nodejs/"*.db-journal
    rm -rf "$INSTALL_DIR/logs" "$INSTALL_DIR/.git"
fi

cd "$INSTALL_DIR"

# 4. 安装后端依赖（生产模式，自动下载 better-sqlite3 预编译二进制）
echo "📦 安装后端依赖（生产模式）..."
cd "$INSTALL_DIR/backend-nodejs"
npm install --omit=dev --no-audit --no-fund

# 5. 生成 .env（若不存在）
if [ ! -f "$INSTALL_DIR/.env" ]; then
    cp "$INSTALL_DIR/deploy/.env.example" "$INSTALL_DIR/.env"
    # 自动生成一个强随机 JWT 密钥
    if command -v openssl >/dev/null 2>&1; then
        sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$(openssl rand -hex 32)|" "$INSTALL_DIR/.env"
    fi
    echo "✅ 已生成 .env（JWT_SECRET 已随机化，请妥善保存）"
fi

# 6. 初始化数据库（首次启动服务时会自动完成，此处预演以确保无误）
echo "🗄️  初始化数据库..."
node -e "require('./db-init/init').ensureDatabase().then(()=>{console.log('✅ 数据库初始化完成');process.exit(0)}).catch(e=>{console.error('❌',e.message);process.exit(1)})"

# 7. 修复前端硬编码的 localhost:3000（改用相对路径，兼容内网域名）
if [ -f "$INSTALL_DIR/deploy/fix-frontend-api.sh" ]; then
    bash "$INSTALL_DIR/deploy/fix-frontend-api.sh"
fi

# 8. 安装 systemd 服务
if command -v systemctl >/dev/null 2>&1; then
    echo "⚙️  安装 systemd 服务..."
    cp "$INSTALL_DIR/deploy/talent-assessment.service" /etc/systemd/system/${APP_NAME}.service
    systemctl daemon-reload
    systemctl enable ${APP_NAME}.service
    systemctl restart ${APP_NAME}.service
    sleep 3
    if systemctl is-active --quiet ${APP_NAME}.service; then
        echo "✅ 服务已启动并通过 systemd 托管（开机自启）"
    else
        echo "⚠️  服务启动失败，请查看：journalctl -u ${APP_NAME}.service -n 50"
    fi
else
    echo "ℹ️  未检测到 systemd，跳过服务注册。可手动运行：bash $INSTALL_DIR/deploy/start.sh"
fi

echo ""
echo "=============================================="
echo "  ✅ 安装完成！"
echo "  本地访问: http://localhost:3000"
echo "  管理员:  admin / admin123"
echo "  配置文件: $INSTALL_DIR/.env"
echo "  数据位置: $INSTALL_DIR/backend-nodejs/talent_assessment_new.db"
echo "=============================================="
echo ""
echo "💡 如需通过公司域名访问，请参考 deploy/README.md 配置 Nginx 反向代理。"
