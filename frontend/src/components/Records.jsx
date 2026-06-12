import { useState } from "react";
import { getHistory, getStats, getAchievements, clearAll } from "../lib/storage.js";
import { ACHIEVEMENTS, getProgress } from "../lib/achievements.js";

const GAME_NAMES = {
  ludo: "飞行棋", truth: "真心话大冒险", dice: "情侣骰子",
  compatibility: "默契挑战", tarot: "抽签塔罗", draw: "你画我猜", karaoke: "双人K歌"
};

function fmtTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  return d.toLocaleDateString("zh-CN");
}

export function HistoryPanel({ onClose }) {
  const [hist, setHist] = useState(getHistory());
  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">📜 历史记录</h3>
        <button onClick={onClose} className="text-gray-400 text-sm">关闭</button>
      </div>
      {hist.length === 0 ? (
        <p className="text-center text-gray-400 py-8">还没有记录 🎮<br/><span className="text-xs">玩一局就会出现在这里</span></p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {hist.map((h, i) => (
            <div key={i} className="p-2 bg-gray-50 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-sm">{GAME_NAMES[h.game] || h.game}</div>
                <div className="text-xs text-gray-500">{fmtTime(h.at)} · {h.result || "—"}</div>
              </div>
              {h.win && <span className="text-xl">🏆</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StatsPanel({ onClose }) {
  const [stats, setStats] = useState(getStats());
  const total = stats.totalPlayed || 0;
  const wins = stats.totalWins || 0;
  const winRate = total > 0 ? Math.round(wins / total * 100) : 0;
  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">📊 数据统计</h3>
        <button onClick={onClose} className="text-gray-400 text-sm">关闭</button>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3 bg-pink-50 rounded-2xl">
          <div className="text-2xl font-extrabold text-pink-600">{total}</div>
          <div className="text-xs text-gray-500">总对局</div>
        </div>
        <div className="p-3 bg-green-50 rounded-2xl">
          <div className="text-2xl font-extrabold text-green-600">{wins}</div>
          <div className="text-xs text-gray-500">胜利</div>
        </div>
        <div className="p-3 bg-purple-50 rounded-2xl">
          <div className="text-2xl font-extrabold text-purple-600">{winRate}%</div>
          <div className="text-xs text-gray-500">胜率</div>
        </div>
      </div>
      <div className="space-y-1">
        {Object.entries(GAME_NAMES).map(([k, name]) => {
          const s = stats[k] || { played: 0, won: 0 };
          const pct = total > 0 ? Math.round(s.played / total * 100) : 0;
          return (
            <div key={k} className="flex items-center gap-2 text-sm">
              <div className="w-20 text-gray-600">{name}</div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-400 to-pink-600" style={{ width: `${pct}%` }} />
              </div>
              <div className="w-12 text-right text-gray-500">{s.played}局</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AchievementsPanel({ onClose, onUnlock }) {
  const [unlocked, setUnlocked] = useState(getAchievements());
  const progress = getProgress();
  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">🏆 成就 ({progress.unlocked}/{progress.total})</h3>
        <button onClick={onClose} className="text-gray-400 text-sm">关闭</button>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500" style={{ width: `${progress.percent}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
        {ACHIEVEMENTS.map(a => {
          const got = unlocked.find(x => x.id === a.id);
          return (
            <div key={a.id} className={`p-3 rounded-2xl text-center transition ${got ? "bg-gradient-to-br from-yellow-50 to-orange-50 ring-2 ring-yellow-300" : "bg-gray-50 opacity-50"}`}>
              <div className={`text-3xl ${got ? "" : "grayscale"}`}>{a.emoji}</div>
              <div className="font-bold text-sm mt-1">{a.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{a.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
