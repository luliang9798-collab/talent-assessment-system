#!/bin/bash

# 人才测评系统停止脚本

echo "正在停止人才测评系统..."

PORT=3000

# 查找并杀掉占用端口的进程
if netstat -ano | grep -q ":$PORT.*LISTENING"; then
    netstat -ano | grep ":$PORT" | grep LISTENING | awk '{print $NF}' | sort -u | while read pid; do
        echo "杀掉进程: $pid"
        taskkill /F /PID $pid 2>/dev/null
    done
    echo "✅ 系统已停止"
else
    echo "系统未运行"
fi
