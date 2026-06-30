@echo off
chcp 65001 >nul
echo ==========================================
echo 人才测评系统 - 一键部署脚本 (Windows)
echo ==========================================

REM 检查Docker是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo 错误: Docker未安装，请先安装Docker Desktop
    echo 下载地址: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo.
echo 步骤1: 停止并删除旧容器...
docker-compose down

echo.
echo 步骤2: 构建后端应用...
cd backend
if not exist "target\talent-assessment-1.0.0.jar" (
    echo 正在使用Maven构建项目...
    call mvn clean package -DskipTests
)
cd ..

echo.
echo 步骤3: 启动所有服务...
docker-compose up -d

echo.
echo 步骤4: 等待服务启动...
echo 正在启动MySQL...
timeout /t 10 /nobreak >nul

echo 正在启动后端服务...
timeout /t 20 /nobreak >nul

echo 正在启动前端服务...
timeout /t 5 /nobreak >nul

echo.
echo ==========================================
echo 部署完成！
echo ==========================================
echo.
echo 访问地址:
echo   前端: http://localhost
echo   后端API: http://localhost:8080/api
echo.
echo 默认登录账号:
echo   用户名: admin
echo   密码: admin123
echo.
echo 查看日志:
echo   docker-compose logs -f [服务名]
echo   服务名: mysql, backend, frontend, redis
echo.
echo 停止系统:
echo   docker-compose down
echo.
pause
