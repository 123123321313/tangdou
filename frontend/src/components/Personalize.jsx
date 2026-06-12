import { useState, useEffect } from "react";
import { getSettings, saveSettings } from "../lib/storage.js";

const THEMES = [
  { id: "candy", name: "糖豆粉", primary: "#ff4787", secondary: "#10b981", emoji: "🍬" },
  { id: "mint", name: "薄荷绿", primary: "#10b981", secondary: "#3b82f6", emoji: "🌿" },
  { id: "sakura", name: "樱花粉", primary: "#ec4899", secondary: "#a855f7", emoji: "🌸" },
  { id: "night", name: "星空紫", primary: "#8b5cf6", secondary: "#06b6d4", emoji: "🌌" }
];

const AVATARS = ["💗", "🍓", "🍵", "🌸", "🐰", "🐱", "🐶", "🦊", "🐼", "🐯", "🦄", "🌟", "🍭", "🍩", "🌙", "☀️", "🌈", "🔥", "💎", "🎵", "🎮", "📚", "✈️", "🌍"];

export function applyTheme(themeId, dark) {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const root = document.documentElement;
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--secondary", theme.secondary);
  root.dataset.theme = themeId;
  root.dataset.dark = dark ? "1" : "0";
  if (dark) document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
}

export function ThemeSwitcher({ onClose }) {
  const s = getSettings();
  const [theme, setTheme] = useState(s.theme || "candy");
  const [dark, setDark] = useState(!!s.dark);
  useEffect(() => { applyTheme(theme, dark); }, [theme, dark]);
  const pick = (id) => { setTheme(id); saveSettings({ theme: id }); };
  const toggle = (v) => { setDark(v); saveSettings({ dark: v }); };
  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">🎨 主题</h3>
        <button onClick={onClose} className="text-gray-400 text-sm">关闭</button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {THEMES.map(t => (
          <button key={t.id} onClick={() => pick(t.id)}
            className={`p-3 rounded-2xl border-2 transition ${theme === t.id ? "border-gray-800 scale-105" : "border-gray-200"}`}
            style={{ background: `linear-gradient(135deg, ${t.primary}22, ${t.secondary}22)` }}
          >
            <div className="text-2xl">{t.emoji}</div>
            <div className="text-xs font-bold mt-1">{t.name}</div>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
        <span className="text-sm">🌓 暗黑模式</span>
        <button onClick={() => toggle(!dark)}
          className={`w-12 h-6 rounded-full transition ${dark ? "bg-gray-800" : "bg-gray-300"}`}>
          <div className={`w-5 h-5 rounded-full bg-white shadow transform transition ${dark ? "translate-x-6" : "translate-x-0.5"}`} />
        </button>
      </div>
    </div>
  );
}

export function AvatarPicker({ value, onPick }) {
  return (
    <div className="card">
      <div className="text-sm text-gray-500 mb-2">选个头像</div>
      <div className="grid grid-cols-8 gap-2">
        {AVATARS.map(a => (
          <button key={a} onClick={() => onPick(a)}
            className={`text-2xl p-2 rounded-xl transition ${value === a ? "bg-pink-100 ring-2 ring-pink-400" : "hover:bg-gray-100"}`}>
            {a}
          </button>
        ))}
      </div>
    </div>
  );
}

export { THEMES, AVATARS };
