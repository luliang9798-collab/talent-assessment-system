#!/bin/bash

# 人才测评系统启动脚本

echo "正在启动人才测评系统..."

# 检查端口是否被占用
PORT=3000
if netstat -ano | grep -q ":$PORT.*LISTENING"; then
    echo "端口 $PORT 已被占用，正在清理..."
    netstat -ano | grep ":$PORT" | grep LISTENING | awk '{print $NF}' | sort -u | while read pid; do
        echo "杀掉进程: $pid"
        taskkill /F /PID $pid 2>/dev/null
    done
    sleep 2
fi

# 启动后端服务
cd backend-nodejs
echo "启动后端服务..."
nohup node server.js > server.log 2>&1 &

# 等待服务启动
sleep 3

# 检查服务是否启动成功
if netstat -ano | grep -q ":$PORT.*LISTENING"; then
    echo "✅ 系统启动成功！"
    echo ""
    echo "访问地址: http://localhost:$PORT"
    echo "用户名: admin"
    echo "密码: admin123"
    echo ""
    echo "功能页面:"
    echo "  - 主页: http://localhost:$PORT"
    echo "  - 测评: http://localhost:$PORT/assessment.html"
    echo "  - 报告: http://localhost:$PORT/report.html"
    echo "  - 九宫格: http://localhost:$PORT/nine-box.html"
    echo ""
    echo "日志文件: backend-nodejs/server.log"
else
    echo "❌ 系统启动失败，请查看日志: backend-nodejs/server.log"
    exit 1
fi
