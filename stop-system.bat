@echo off
chcp 65001 >nul
echo 正在停止人才测评系统...

set PORT=3000

REM 查找并杀掉占用端口的进程
netstat -ano | findstr ":%PORT%.*LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%.*LISTENING"') do (
        echo 杀掉进程: %%a
        taskkill /F /PID %%a >nul 2>&1
    )
    echo ✅ 系统已停止
) else (
    echo 系统未运行
)

pause
