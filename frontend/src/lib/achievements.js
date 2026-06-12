// 成就系统定义
export const ACHIEVEMENTS = [
  { id: "first_game", emoji: "🎮", name: "初次邂逅", desc: "完成第一局游戏", check: (s) => (s.totalPlayed || 0) >= 1 },
  { id: "play_10", emoji: "🔟", name: "资深玩家", desc: "累计玩 10 局", check: (s) => (s.totalPlayed || 0) >= 10 },
  { id: "play_50", emoji: "💯", name: "游戏狂魔", desc: "累计玩 50 局", check: (s) => (s.totalPlayed || 0) >= 50 },
  { id: "win_streak_3", emoji: "🔥", name: "三连胜", desc: "连胜 3 局", check: (s) => (s.maxStreak || 0) >= 3 },
  { id: "all_games", emoji: "🏆", name: "全能王", desc: "玩过所有 7 个游戏", check: (s) => Object.keys({ludo:1,truth:1,dice:1,compatibility:1,tarot:1,draw:1,karaoke:1}).every(g => s[g]) },
  { id: "perfect_compat", emoji: "💯", name: "心有灵犀", desc: "默契挑战全对（≥8分）", check: (s) => (s.compatibility?.bestScore || 0) >= 8 },
  { id: "ludo_champion", emoji: "🎲", name: "飞行棋大师", desc: "飞行棋胜利 5 次", check: (s) => (s.ludo?.won || 0) >= 5 },
  { id: "deep_truth", emoji: "🌙", name: "深夜真心话", desc: "玩过 3 次以上暧昧级真心话", check: (s) => (s.spicyTruthCount || 0) >= 3 },
  { id: "draw_master", emoji: "🎨", name: "灵魂画手", desc: "你画我猜赢 3 轮", check: (s) => (s.draw?.won || 0) >= 3 },
  { id: "karaoke_star", emoji: "🎤", name: "灵魂歌者", desc: "K 歌获得 9+ 分", check: (s) => (s.karaoke?.highScore || 0) >= 9 },
  { id: "midnight", emoji: "🌃", name: "深夜档", desc: "在 0-5 点玩过游戏", check: (s, ctx) => ctx.hour >= 0 && ctx.hour < 5 },
  { id: "week_streak", emoji: "📅", name: "一周常客", desc: "连续 7 天登录", check: (s) => (s.loginDays?.length || 0) >= 7 }
];

export function checkAll(stats, ctx = {}) {
  const newly = [];
  for (const a of ACHIEVEMENTS) {
    if (a.check(stats, ctx)) {
      const ok = unlockAchievement(a.id);
      if (ok) newly.push(a);
    }
  }
  return newly;
}

export function getProgress() {
  const stats = JSON.parse(localStorage.getItem("td_stats") || "{}");
  const all = ACHIEVEMENTS.length;
  const unlocked = (JSON.parse(localStorage.getItem("td_achievements") || "[]")).length;
  return { unlocked, total: all, percent: Math.round(unlocked / all * 100) };
}
