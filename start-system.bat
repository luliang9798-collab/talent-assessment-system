@echo off
chcp 65001 >nul
echo 正在启动人才测评系统...

cd /d "%~dp0"

REM 检查端口是否被占用
set PORT=3000
netstat -ano | findstr ":%PORT%.*LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo 端口 %PORT% 已被占用，正在清理...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%.*LISTENING"') do (
        echo 杀掉进程: %%a
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

REM 启动后端服务
cd backend-nodejs
echo 启动后端服务...
start /min "人才测评系统后端" node server.js

REM 等待服务启动
timeout /t 3 /nobreak >nul

REM 检查服务是否启动成功
netstat -ano | findstr ":%PORT%.*LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo ✅ 系统启动成功！
    echo.
    echo 访问地址: http://localhost:%PORT%
    echo 用户名: admin
    echo 密码: admin123
    echo.
    echo 功能页面:
    echo   - 主页: http://localhost:%PORT%
    echo   - 测评: http://localhost:%PORT%/assessment.html
    echo   - 报告: http://localhost:%PORT%/report.html
    echo   - 九宫格: http://localhost:%PORT%/nine-box.html
    echo.
    echo 日志文件: backend-nodejs\server.log
    echo.
    echo 正在打开浏览器...
    start http://localhost:%PORT%
) else (
    echo.
    echo ❌ 系统启动失败，请查看日志: backend-nodejs\server.log
    pause
    exit /b 1
)
