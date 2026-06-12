import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, setProfile } from "../lib/storage.js";
import { applyTheme, ThemeSwitcher, AvatarPicker } from "../components/Personalize.jsx";
import { HistoryPanel, StatsPanel, AchievementsPanel } from "../components/Records.jsx";
import InstallButton from "../components/InstallButton.jsx";

export default function Home() {
  const nav = useNavigate();
  const [profile, setProf] = useState(getProfile());
  const [name, setName] = useState(profile.name || "");
  const [avatar, setAvatar] = useState(profile.avatar || "💗");
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState("home");

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem("td_settings") || "{}");
    applyTheme(s.theme || "candy", !!s.dark);
  }, []);

  const create = async (withPwd) => {
    if (!name.trim()) return alert("先给自己起个昵称呗 🍬");
    setBusy(true);
    try {
      const r = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: withPwd ? password : null })
      });
      const { roomId } = await r.json();
      setProfile({ ...profile, name, avatar });
      nav(`/room/${roomId}`);
    } finally { setBusy(false); }
  };
  const join = () => {
    if (!name.trim()) return alert("先给自己起个昵称呗 🍬");
    if (!roomId.trim()) return alert("输入房间号 ✨");
    setProfile({ ...profile, name, avatar });
    nav(`/room/${roomId.trim().toUpperCase()}`);
  };

  if (page === "history") return <div className="min-h-full p-4 max-w-md mx-auto pt-10"><HistoryPanel onClose={() => setPage("home")} /></div>;
  if (page === "stats") return <div className="min-h-full p-4 max-w-md mx-auto pt-10"><StatsPanel onClose={() => setPage("home")} /></div>;
  if (page === "achievements") return <div className="min-h-full p-4 max-w-md mx-auto pt-10"><AchievementsPanel onClose={() => setPage("home")} /></div>;
  if (page === "settings") return <div className="min-h-full p-4 max-w-md mx-auto pt-10 space-y-3"><ThemeSwitcher onClose={() => setPage("home")} /></div>;
  if (page === "avatar") return <div className="min-h-full p-4 max-w-md mx-auto pt-10"><AvatarPicker value={avatar} onPick={(a) => { setAvatar(a); setPage("home"); }} /></div>;

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3 animate-bounce">{avatar}</div>
          <h1 className="text-4xl font-extrabold text-pink-600 tracking-wide">糖豆</h1>
          <p className="text-pink-400 mt-1 text-sm">情侣双人小游戏 · 7 款 · 永久免费</p>
        </div>
        <div className="card space-y-4">
          <div>
            <label className="text-sm text-gray-500 ml-2">你的昵称</label>
            <input className="input mt-1" placeholder="比如：甜甜" value={name} onChange={e => setName(e.target.value)} maxLength={10} />
          </div>
          <div>
            <label className="text-sm text-gray-500 ml-2">头像</label>
            <div className="flex gap-2 overflow-x-auto pb-1 mt-1">
              {["💗", "🍓", "🍵", "🌸", "🐰", "🐱", "🐶", "🦊", "🐼", "🌟", "🍭", "🌙", "🎮", "📚", "🌈", "🔥"].map(a => (
                <button key={a} onClick={() => setAvatar(a)} className={`text-2xl p-1.5 rounded-xl shrink-0 ${avatar === a ? "bg-pink-100 ring-2 ring-pink-400" : "bg-gray-50"}`}>{a}</button>
              ))}
              <button onClick={() => setPage("avatar")} className="text-sm text-pink-500 px-2 shrink-0">更多 ›</button>
            </div>
          </div>
          <button className="btn-primary w-full text-lg" onClick={() => create(false)} disabled={busy}>
            {busy ? "创建中..." : "✨ 创建房间"}
          </button>
          {!showPwd ? (
            <button className="btn-secondary w-full text-sm" onClick={() => setShowPwd(true)}>🔒 创建密码房间</button>
          ) : (
            <div className="space-y-2">
              <input className="input" placeholder="设置房间密码" value={password} onChange={e => setPassword(e.target.value)} maxLength={20} />
              <div className="grid grid-cols-2 gap-2">
                <button className="btn-secondary" onClick={() => setShowPwd(false)}>取消</button>
                <button className="btn-primary" onClick={() => create(true)}>创建</button>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <div className="flex-1 h-px bg-gray-200" /> 或加入 <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div>
            <label className="text-sm text-gray-500 ml-2">房间号</label>
            <input className="input mt-1 uppercase tracking-widest" placeholder="6位房间号" value={roomId} onChange={e => setRoomId(e.target.value.toUpperCase())} maxLength={6} />
          </div>
          <button className="btn-secondary w-full" onClick={join}>加入房间 →</button>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4 text-xs">
          <button onClick={() => setPage("history")} className="text-pink-500 py-2">📜<br/>历史</button>
          <button onClick={() => setPage("stats")} className="text-pink-500 py-2">📊<br/>统计</button>
          <button onClick={() => setPage("achievements")} className="text-pink-500 py-2">🏆<br/>成就</button>
          <button onClick={() => setPage("settings")} className="text-pink-500 py-2">⚙️<br/>设置</button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-3">完全免费 · 永久会员 · 无广告</p>
        <div className="mt-3"><InstallButton /></div>
      </div>
    </div>
  );
}