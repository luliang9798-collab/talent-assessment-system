# 人才测评系统 - 生产环境 Docker 镜像
# 基础镜像使用 Debian (bullseye)，better-sqlite3 可下载 glibc 预编译二进制
# 无需源码编译；若需 Alpine，请自行准备 build 阶段编译原生模块
FROM node:20-bullseye-slim

# 安装必要运行时（curl 用于健康检查；ca-certificates 便于访问外源）
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 创建非 root 用户
RUN groupadd -g 1001 -r nodejs && \
    useradd -m -u 1001 -r -g nodejs nodejs

WORKDIR /app

# 先复制依赖清单，利用构建缓存
COPY backend-nodejs/package.json ./backend-nodejs/
RUN cd backend-nodejs && npm install --omit=dev --no-audit --no-fund

# 复制后端代码与初始化脚本
COPY backend-nodejs/ ./backend-nodejs/
# 复制前端静态资源（server-minimal.js 通过 ../frontend 提供）
COPY frontend/ ./frontend/

# 创建数据与日志目录并授权
RUN mkdir -p /app/backend-nodejs/data /app/backend-nodejs/logs && \
    chown -R nodejs:nodejs /app/backend-nodejs/data /app/backend-nodejs/logs

# 切换到后端工作目录（保证 ../frontend 路径正确）
WORKDIR /app/backend-nodejs

# 环境变量
ENV PORT=3000
ENV NODE_ENV=production
ENV DB_PATH=/app/backend-nodejs/data/talent_assessment_new.db
ENV JWT_SECRET=change-me-in-production

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# 启动（首次启动自动建库并写入种子数据）
CMD ["node", "server-minimal.js"]
