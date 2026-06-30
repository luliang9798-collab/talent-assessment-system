#!/bin/bash

echo "=========================================="
echo "人才测评系统 - 一键部署脚本"
echo "=========================================="

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "错误: Docker未安装，请先安装Docker"
    echo "安装教程: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "错误: Docker Compose未安装，请先安装Docker Compose"
    echo "安装教程: https://docs.docker.com/compose/install/"
    exit 1
fi

echo ""
echo "步骤1: 停止并删除旧容器..."
docker-compose down

echo ""
echo "步骤2: 构建后端应用..."
cd backend
if [ ! -f "target/talent-assessment-1.0.0.jar" ]; then
    echo "正在使用Maven构建项目..."
    mvn clean package -DskipTests
fi
cd ..

echo ""
echo "步骤3: 启动所有服务..."
docker-compose up -d

echo ""
echo "步骤4: 等待服务启动..."
echo "正在启动MySQL..."
sleep 10

echo "正在启动后端服务..."
sleep 20

echo "正在启动前端服务..."
sleep 5

echo ""
echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo ""
echo "访问地址:"
echo "  前端: http://localhost"
echo "  后端API: http://localhost:8080/api"
echo "  Swagger文档: http://localhost:8080/api/swagger-ui.html"
echo ""
echo "默认登录账号:"
echo "  用户名: admin"
echo "  密码: admin123"
echo ""
echo "查看日志:"
echo "  docker-compose logs -f [服务名]"
echo "  服务名: mysql, backend, frontend, redis"
echo ""
echo "停止系统:"
echo "  docker-compose down"
echo ""
