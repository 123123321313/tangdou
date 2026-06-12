import { useState, useRef } from "react";

export function InvitePoster({ roomId, onClose }) {
  const canvasRef = useRef(null);
  const [theme, setTheme] = useState("candy");
  const themes = {
    candy: { bg: "linear-gradient(135deg, #ff4787, #ff9bbb)", text: "#fff" },
    night: { bg: "linear-gradient(135deg, #1e1b4b, #581c87)", text: "#fff" },
    mint: { bg: "linear-gradient(135deg, #10b981, #6ee7b7)", text: "#fff" }
  };
  const draw = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const W = 400, H = 600;
    c.width = W; c.height = H;
    const t = themes[theme];
    // 背景渐变
    const grd = ctx.createLinearGradient(0, 0, W, H);
    const cols = t.bg.match(/#[0-9a-f]{6}/gi) || ["#ff4787", "#ff9bbb"];
    grd.addColorStop(0, cols[0]); grd.addColorStop(1, cols[1]);
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
    // 装饰圆点
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.15})`;
      ctx.beginPath();
      ctx.arc(Math.random() * W, Math.random() * H, 10 + Math.random() * 20, 0, Math.PI * 2);
      ctx.fill();
    }
    // 标题
    ctx.fillStyle = t.text;
    ctx.font = "bold 64px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🍬", W / 2, 130);
    ctx.font = "bold 48px sans-serif";
    ctx.fillText("糖豆", W / 2, 200);
    ctx.font = "22px sans-serif";
    ctx.fillText("情侣双人小游戏", W / 2, 240);
    // 房间号框
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    const boxW = 320, boxH = 140, boxX = (W - boxW) / 2, boxY = 290;
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.fillStyle = "#333";
    ctx.font = "18px sans-serif";
    ctx.fillText("房间号", W / 2, boxY + 35);
    ctx.fillStyle = "#ff4787";
    ctx.font = "bold 56px monospace";
    ctx.fillText(roomId, W / 2, boxY + 100);
    // 底部
    ctx.fillStyle = t.text;
    ctx.font = "16px sans-serif";
    ctx.fillText("一起玩 7 款情侣游戏 ✨", W / 2, 490);
    ctx.font = "12px sans-serif";
    ctx.fillText("打开糖豆 · 输入房间号加入", W / 2, 520);
  };
  // 每次主题/roomId 变化都重画
  setTimeout(draw, 0);
  const download = () => {
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url; a.download = `糖豆邀请_${roomId}.png`;
    a.click();
  };
  const share = async () => {
    if (navigator.share && canvasRef.current) {
      canvasRef.current.toBlob(blob => {
        const file = new File([blob], "tangdou.png", { type: "image/png" });
        navigator.share({ title: "糖豆邀请", text: `来一起玩！房间号 ${roomId}`, files: [file] }).catch(() => {});
      });
    } else {
      navigator.clipboard?.writeText(`来一起玩糖豆！房间号: ${roomId}`);
      alert("房间号已复制到剪贴板");
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-4 max-w-md w-full space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">🎨 邀请海报</h3>
          <button onClick={onClose} className="text-gray-400">✕</button>
        </div>
        <div className="flex gap-2">
          {Object.keys(themes).map(k => (
            <button key={k} onClick={() => setTheme(k)}
              className={`flex-1 py-1 rounded-xl text-xs font-bold ${theme === k ? "bg-pink-500 text-white" : "bg-gray-100"}`}>
              {k === "candy" ? "糖豆" : k === "night" ? "星空" : "薄荷"}
            </button>
          ))}
        </div>
        <canvas ref={canvasRef} className="w-full rounded-2xl shadow-lg" />
        <div className="grid grid-cols-2 gap-2">
          <button onClick={download} className="btn-secondary">💾 保存图片</button>
          <button onClick={share} className="btn-primary">📤 分享</button>
        </div>
      </div>
    </div>
  );
}
