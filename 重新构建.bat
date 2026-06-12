@echo off
chcp 65001 >nul
cd /d "C:\Users\G\Documents\New project\xiaocouple\frontend"
echo 正在重新构建前端 ...
node build.mjs
echo.
echo 构建完成
pause