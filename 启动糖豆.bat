@echo off
chcp 65001 >nul
title 糖豆 - 情侣双人小游戏
echo ============================================
echo   糖豆 正在启动 ...
echo ============================================
echo.
cd /d "C:\Users\G\Documents\New project\xiaocouple\backend"
echo [1/2] 启动服务器 (端口 3001) ...
start "tangdou-server" /MIN "C:\Program Files\nodejs\node.exe" "src/index.js"
echo.
echo [2/2] 等待就绪 ...
timeout /t 3 /nobreak >nul
echo.
echo ============================================
echo   糖豆已启动
echo   浏览器打开: http://localhost:3001
echo.
echo   双击"停止糖豆.bat"可关闭服务
echo ============================================
echo.
echo 按任意键关闭此提示窗口(不会停止服务) ...
pause >nul