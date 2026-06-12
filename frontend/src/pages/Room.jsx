import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket, joinRoom } from "../lib/socket.js";
import Ludo from "../components/games/Ludo.jsx";
import TruthDare from "../components/games/TruthDare.jsx";
import Dice from "../components/games/Dice.jsx";
import Compatibility from "../components/games/Compatibility.jsx";
import Tarot from "../components/games/Tarot.jsx";
import DrawGuess from "../components/games/DrawGuess.jsx";
import Karaoke from "../components/games/Karaoke.jsx";
import { Confetti, Danmaku } from "../components/Effects.jsx";
import { InvitePoster } from "../components/InvitePoster.jsx";
import { startMusic, stopMusic, isMusicPlaying, playSfx } from "../lib/sounds.js";
import { getProfile, addHistory, updateStats, checkAll } from "../lib/storage.js";
import { ACHIEVEMENTS } from "../lib/achievements.js";

const GAMES = [
  { t: "ludo", emoji: "🎲", name: "情侣飞行棋", desc: "掷骰子走格，触发真心话/大冒险", color: "pink" },
  { t: "truth", emoji: "💬", name: "真心话大冒险", desc: "选题目，甜蜜/暧昧/刺激分级", color: "pink" },
  { t: "dice", emoji: "🎯", name: "情侣骰子", desc: "掷出神秘任务", color: "pink" },
  { t: "compatibility", emoji: "💞", name: "默契挑战", desc: "同题作答，看你们多合拍", color: "green" },
  { t: "tarot", emoji: "🔮", name: "抽签塔罗", desc: "每日一签，看你们的运势", color: "green" },
  { t: "draw", emoji: "🎨", name: "你画我猜", desc: "一人画一人猜，计时赛", color: "green" },
  { t: "karaoke", emoji: "🎤", name: "双人 K 歌", desc: "歌词同步跟唱，互评打分", color: "green" }
];

export default function Room() {
  const { id } = useParams();
  const nav = useNavigate();
  const [me, setMe] = useState(null);
  const [players, setPlayers] = useState([]);
  const [started, setStarted] = useState(false);
  const [gameType, setGameType] = useState(null);
  const [game, setGame] = useState(null);
  const [error, setError] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [music, setMusic] = useState(false);
  const [danmaku, setDanmaku] = useState([]);
  const [toast, setToast] = useState(null);
  const myIndex = useRef(0);
  const profile = getProfile();

  const showToast = (text, color = "bg-pink-500") => {
    setToast({ text, color });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    const name = profile.name || "小可爱";
    joinRoom(id, name)
      .then(({ player, room }) => {
        setMe(player);
        setPlayers(room.players);
        myIndex.current = room.players.findIndex(p => p.id === player.id);
        if (room.players.length === 1) showToast("已创建，等 TA 加入", "bg-blue-500");
      })
      .catch(e => setError(e.message));

    const onUpdate = ({ players, started, gameType }) => { setPlayers(players); setStarted(started); setGameType(gameType); };
    const onStart = ({ gameType, game, players }) => {
      setGameType(gameType); setGame(game); setPlayers(players); setStarted(true);
      playSfx("success");
      showToast("游戏开始 🎮", "bg-pink-500");
    };
    const onDice = (payload) => {
      setGame(g => {
        if (!g) return g;
        if (payload.type === "ludo") {
          if (payload.winner !== undefined) {
            setShowConfetti(true);
            playSfx("win");
            recordResult(gameType, true);
            setTimeout(() => setShowConfetti(false), 4000);
          }
          return { ...g, lastDice: payload.dice, lastEvent: payload.event, positions: payload.positions || g.positions, turn: payload.turn, winner: payload.winner ?? g.winner };
        }
        if (payload.type === "dice") return { ...g, lastRoll: payload.roll, lastAction: payload.action };
        return g;
      });
    };
    const onTurn = ({ turn }) => setGame(g => g ? { ...g, turn } : g);
    const onQ = ({ question, level, type }) => setGame(g => g ? { ...g, currentQuestion: question, currentLevel: level, currentType: type } : g);
    const onCompat = (payload) => {
      setGame(g => g ? { ...g, ...payload } : g);
      if (payload.finished) {
        setShowConfetti(true);
        playSfx("win");
        recordResult("compatibility", payload.score >= 5);
        updateStats("compatibility", payload.score >= 5);
        const stats = JSON.parse(localStorage.getItem("td_stats") || "{}");
        stats.compatibility = stats.compatibility || { played: 0, won: 0, bestScore: 0 };
        stats.compatibility.bestScore = Math.max(stats.compatibility.bestScore || 0, payload.score);
        localStorage.setItem("td_stats", JSON.stringify(stats));
        checkAchievements();
        setTimeout(() => setShowConfetti(false), 4000);
      }
    };
    const onTarot = (payload) => setGame(g => g ? { ...g, ...payload } : g);
    const onDraw = (payload) => {
      setGame(g => g ? { ...g, ...payload } : g);
      if (payload.guessed) {
        playSfx("success");
        showToast("🎉 猜对啦！");
      }
      if (payload.finished) {
        setShowConfetti(true);
        playSfx("win");
        recordResult("draw", true);
        checkAchievements();
        setTimeout(() => setShowConfetti(false), 4000);
      }
    };
    const onDanmaku = (msg) => setDanmaku(prev => [...prev, msg].slice(-20));
    const onRestart = () => { setStarted(false); setGameType(null); setGame(null); };

    socket.on("room-update", onUpdate);
    socket.on("game-started", onStart);
    socket.on("dice-rolled", onDice);
    socket.on("turn-changed", onTurn);
    socket.on("question-picked", onQ);
    socket.on("compatibility-update", onCompat);
    socket.on("tarot-update", onTarot);
    socket.on("draw-update", onDraw);
    socket.on("danmaku", onDanmaku);
    socket.on("game-restarted", onRestart);
    return () => {
      socket.off("room-update", onUpdate);
      socket.off("game-started", onStart);
      socket.off("dice-rolled", onDice);
      socket.off("turn-changed", onTurn);
      socket.off("question-picked", onQ);
      socket.off("compatibility-update", onCompat);
      socket.off("tarot-update", onTarot);
      socket.off("draw-update", onDraw);
      socket.off("danmaku", onDanmaku);
      socket.off("game-restarted", onRestart);
    };
  }, [id]);

  const recordResult = (g, win) => {
    addHistory({ game: g, win, result: win ? "胜利" : "—", players: players.map(p => p.name) });
    updateStats(g, win);
    checkAchievements();
  };

  const checkAchievements = () => {
    const stats = JSON.parse(localStorage.getItem("td_stats") || "{}");
    const hour = new Date().getHours();
    const newly = checkAll(stats, { hour });
    for (const a of newly) {
      playSfx("unlock");
      showToast(`🏆 解锁成就：${a.name}`, "bg-yellow-500");
    }
  };

  const startGame = (t) => { socket.emit("start-game", { roomId: id, gameType: t }); playSfx("click"); };
  const restart = () => { socket.emit("restart-game", { roomId: id }); playSfx("click"); };
  const toggleMusic = () => {
    if (music) { stopMusic(); setMusic(false); }
    else { startMusic(); setMusic(true); }
  };
  const sendDanmaku = (text) => { socket.emit("danmaku", { roomId: id, text }); };

  if (error) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-6">
        <div className="card text-center">
          <div className="text-5xl mb-3">😢</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button className="btn-primary" onClick={() => nav("/")}>返回首页</button>
        </div>
      </div>
    );
  }

  const canStart = players.length === 2 && !started;

  return (
    <div className="min-h-full p-4 max-w-2xl mx-auto">
      {/* 顶部控制栏 */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => nav("/")} className="text-pink-500 font-bold">← 退出</button>
        <button onClick={toggleMusic} className="text-xl">{music ? "🔊" : "🔇"}</button>
        <button onClick={() => setShowInvite(true)} className="text-pink-500 font-bold text-sm">📤 邀请</button>
      </div>

      {/* 房间号 + 玩家卡片 */}
      <div className="card mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-gray-400">糖豆 · 房间号</div>
          <div className="font-extrabold text-pink-600 tracking-widest text-lg">{id}</div>
        </div>
        <div className="flex items-center justify-around">
          {players.length === 0 && <div className="text-gray-400">等待加入...</div>}
          {players.map((p, i) => (
            <div key={p.id} className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-pink-100">
                {p.avatar || (i === 0 ? "🍓" : "🍵")}
              </div>
              <div className="mt-1 text-sm font-bold text-gray-700">{p.name}{p.id === me?.id && " (我)"}</div>
            </div>
          ))}
          {players.length < 2 && (
            <div className="text-center opacity-50">
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-2xl">?</div>
              <div className="mt-1 text-sm text-gray-400">等待对方</div>
            </div>
          )}
        </div>
      </div>

      <Danmaku messages={danmaku} onSend={sendDanmaku} />

      {/* 游戏选择 */}
      {!started && (
        <div className="card">
          <h2 className="text-center text-lg font-bold text-gray-700 mb-3">🍬 选个游戏开始玩</h2>
          <div className="space-y-2">
            {GAMES.map(g => (
              <button key={g.t} disabled={!canStart} onClick={() => startGame(g.t)}
                className={`w-full text-left p-3 rounded-2xl border-2 transition flex items-center gap-3 ${canStart ? "border-pink-100 hover:border-pink-400 hover:bg-pink-50 active:scale-[0.98]" : "border-gray-100 opacity-50"}`}>
                <div className="text-2xl">{g.emoji}</div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800">{g.name}</div>
                  <div className="text-xs text-gray-500">{g.desc}</div>
                </div>
                <div className="text-pink-400">→</div>
              </button>
            ))}
          </div>
          {!canStart && <p className="text-center text-sm text-gray-400 mt-3">需要 2 人都加入后才能开始</p>}
        </div>
      )}

      {started && gameType === "ludo" && <Ludo roomId={id} game={game} players={players} me={me} onRoll={() => socket.emit("roll-dice", { roomId: id })} onNext={() => socket.emit("next-turn", { roomId: id })} onRestart={restart} />}
      {started && gameType === "truth" && <TruthDare roomId={id} game={game} onTruth={(l) => { socket.emit("pick-truth", { roomId: id, level: l }); recordSpicyTruth(l); }} onDare={(l) => socket.emit("pick-dare", { roomId: id, level: l })} onRestart={restart} />}
      {started && gameType === "dice" && <Dice roomId={id} game={game} onRoll={() => socket.emit("roll-dice", { roomId: id })} onRestart={restart} />}
      {started && gameType === "compatibility" && <Compatibility roomId={id} game={game} onAnswer={(a) => socket.emit("compatibility-answer", { roomId: id, answer: a })} onNext={() => socket.emit("compatibility-next", { roomId: id })} onRestart={restart} />}
      {started && gameType === "tarot" && <Tarot roomId={id} game={game} onDraw={() => { socket.emit("tarot-draw", { roomId: id }); recordResult("tarot", false); }} onRestart={restart} />}
      {started && gameType === "draw" && <DrawGuess roomId={id} game={game} players={players} me={me} onStroke={(d) => socket.emit("draw-stroke", { roomId: id, data: d })} onGuess={(g) => socket.emit("draw-guess", { roomId: id, guess: g })} onNext={() => socket.emit("draw-next", { roomId: id })} onRestart={restart} />}
      {started && gameType === "karaoke" && <Karaoke roomId={id} game={game} onScore={(s) => { socket.emit("karaoke-score", { roomId: id, score: s }); const stats = JSON.parse(localStorage.getItem("td_stats") || "{}"); stats.karaoke = stats.karaoke || {}; stats.karaoke.highScore = Math.max(stats.karaoke.highScore || 0, s); localStorage.setItem("td_stats", JSON.stringify(stats)); checkAchievements(); }} onRestart={restart} />}

      <Confetti active={showConfetti} />
      {showInvite && <InvitePoster roomId={id} onClose={() => setShowInvite(false)} />}

      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 ${toast.color} text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold animate-bounce`}>
          {toast.text}
        </div>
      )}
    </div>
  );
}

function recordSpicyTruth(level) {
  if (level !== "spicy" && level !== "wild") return;
  const stats = JSON.parse(localStorage.getItem("td_stats") || "{}");
  stats.spicyTruthCount = (stats.spicyTruthCount || 0) + 1;
  localStorage.setItem("td_stats", JSON.stringify(stats));
  const newly = (window).checkAll?.(stats, {}) || [];
  for (const a of newly) { /* 触发提示 */ }
}
