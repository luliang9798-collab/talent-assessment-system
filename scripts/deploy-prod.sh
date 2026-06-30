#!/bin/bash

# 生产环境部署脚本

set -e

echo "===================================="
echo "人才测评系统生产环境部署"
echo "===================================="

# 检查Docker
if ! command -v docker &> /dev/null; then
    echo "错误: Docker未安装"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "错误: Docker Compose未安装"
    exit 1
fi

# 创建必要目录
mkdir -p data backups logs

# 设置权限
chmod 755 data backups logs

# 构建并启动服务
echo "正在构建Docker镜像..."
docker-compose -f docker-compose.prod.yml build

echo "正在启动服务..."
docker-compose -f docker-compose.prod.yml up -d

# 等待服务启动
echo "等待服务启动..."
sleep 10

# 检查服务健康状态
echo "检查服务健康状态..."
docker-compose -f docker-compose.prod.yml ps

# 初始化数据库（如果需要）
echo "初始化数据库..."
docker exec talent-assessment-backend-prod node init_db.js || echo "数据库已初始化"

echo "===================================="
echo "部署完成！"
echo "===================================="
echo "前端访问地址: http://localhost"
echo "后端API地址: http://localhost/api"
echo ""
echo "查看日志: docker-compose -f docker-compose.prod.yml logs -f"
echo "停止服务: docker-compose -f docker-compose.prod.yml down"
echo "重启服务: docker-compose -f docker-compose.prod.yml restart"
