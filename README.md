# 糖豆 - 情侣双人小游戏

PWA 部署版。访问 https://<域名> 即可使用，可"添加到主屏幕"装成 app。

## 一键部署

### Vercel (最快)
`
npm i -g vercel
vercel --prod
`

### Netlify
`
npm i -g netlify-cli
netlify deploy --prod --dir=frontend/dist
`

### Cloudflare Pages
`
npm i -g wrangler
wrangler pages deploy frontend/dist --project-name=tangdou
`

## 文件结构
- frontend/dist/    静态 PWA (含 service worker / manifest / 图标)
- backend/          Node 服务 (WebSocket 房间 + API)
- 启动糖豆.bat / 停止糖豆.bat  本地一键启停
- vercel.json / netlify.toml    部署配置

## Android APK 打包
1. 部署到 HTTPS 后，访问 https://www.pwabuilder.com/
2. 填入部署的 URL
3. 点 Package For Stores -> Android
4. 下载 .apk