@echo off
chcp 65001 >nul
taskkill /F /FI "WINDOWTITLE eq tangdou-server*" 2>nul
echo.
echo 糖豆服务器已停止
echo.
pause