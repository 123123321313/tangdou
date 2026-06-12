// 在后端添加静态文件服务：把 frontend/dist 当作站点根目录
import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "..", "..", "frontend", "dist");

export function serveStatic(app) {
  if (!existsSync(DIST)) {
    console.log("[!] frontend/dist 不存在，前端静态服务不可用");
    return;
  }
  app.use(express.static(DIST));
  // SPA fallback
  app.get(/^\/(?!api|socket\.io).*/, (_, res) => {
    res.sendFile(path.join(DIST, "index.html"));
  });
  console.log("[✓] 静态前端已挂载 (来自 frontend/dist)");
}

export { DIST };
