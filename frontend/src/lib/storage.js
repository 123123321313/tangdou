// localStorage 持久化层
const KEYS = {
  PROFILE: "td_profile",
  HISTORY: "td_history",
  STATS: "td_stats",
  ACHIEVEMENTS: "td_achievements",
  SETTINGS: "td_settings"
};

export function getProfile() {
  try { return JSON.parse(localStorage.getItem(KEYS.PROFILE) || "{}"); } catch { return {}; }
}
export function setProfile(p) {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(p));
}

export function getHistory() {
  try { return JSON.parse(localStorage.getItem(KEYS.HISTORY) || "[]"); } catch { return []; }
}
export function addHistory(entry) {
  const h = getHistory();
  h.unshift({ ...entry, at: Date.now() });
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(h.slice(0, 50)));
}

export function getStats() {
  try { return JSON.parse(localStorage.getItem(KEYS.STATS) || "{}"); } catch { return {}; }
}
export function updateStats(gameType, win) {
  const s = getStats();
  s[gameType] = s[gameType] || { played: 0, won: 0 };
  s[gameType].played += 1;
  if (win) s[gameType].won += 1;
  s.totalPlayed = (s.totalPlayed || 0) + 1;
  s.totalWins = (s.totalWins || 0) + (win ? 1 : 0);
  localStorage.setItem(KEYS.STATS, JSON.stringify(s));
  return s;
}

export function getAchievements() {
  try { return JSON.parse(localStorage.getItem(KEYS.ACHIEVEMENTS) || "[]"); } catch { return []; }
}
export function unlockAchievement(id) {
  const a = getAchievements();
  if (a.find(x => x.id === id)) return false;
  a.push({ id, at: Date.now() });
  localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(a));
  return true;
}

export function getSettings() {
  try { return JSON.parse(localStorage.getItem(KEYS.SETTINGS) || "{}"); } catch { return {}; }
}
export function saveSettings(s) {
  const cur = getSettings();
  const merged = { ...cur, ...s };
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(merged));
  return merged;
}

export function clearAll() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}
