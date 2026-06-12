import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { createRoom, getRoom, addPlayer, removePlayer, addSpectator, startGame, rollLudo, nextTurn, pickTruthQuestion, pickDareQuestion, rollDice, compatibilityAnswer, compatibilityNext, tarotDraw, drawAddStroke, drawGuess, drawNext, karaokeScore } from "./rooms.js";
import { serveStatic } from "./static-server.js";

const PORT = process.env.PORT || 3001;
const app = express();
app.use(cors());
app.use(express.json());
serveStatic(app);
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.get("/api/health", (_, res) => res.json({ ok: true, ts: Date.now() }));
app.post("/api/rooms", (req, res) => { const r = createRoom({ password: req.body?.password || null }); res.json({ roomId: r.id }); });
app.get("/api/rooms/:id", (req, res) => {
  const room = getRoom(req.params.id);
  if (!room) return res.status(404).json({ error: "房间不存在" });
  res.json({ id: room.id, hasPassword: !!room.password, playerCount: room.players.length, started: room.started, gameType: room.gameType, spectatorCount: room.spectators.length });
});

io.on("connection", (socket) => {
  console.log(`[+] ${socket.id}`);
  socket.on("join-room", ({ roomId, name, password, role }, cb) => {
    const room = getRoom(roomId);
    if (!room) return cb?.({ ok: false, error: "房间不存在" });
    if (role === "spectator") {
      const spec = addSpectator(room, { id: socket.id, name, socketId: socket.id, password });
      if (spec?.error) return cb?.({ ok: false, error: spec.error });
      socket.join(roomId);
      cb?.({ ok: true, role: "spectator", spectator: spec, room: { id: room.id, players: room.players, started: room.started, gameType: room.gameType } });
      io.to(roomId).emit("room-update", { players: room.players, spectators: room.spectators, started: room.started, gameType: room.gameType });
      return;
    }
    const result = addPlayer(room, { id: socket.id, name, socketId: socket.id, password });
    if (result?.error) return cb?.({ ok: false, error: result.error });
    socket.join(roomId);
    cb?.({ ok: true, role: "player", player: result, room: { id: room.id, players: room.players, started: room.started, gameType: room.gameType, hasPassword: !!room.password } });
    io.to(roomId).emit("room-update", { players: room.players, spectators: room.spectators, started: room.started, gameType: room.gameType });
  });
  socket.on("start-game", ({ roomId, gameType }) => {
    const room = getRoom(roomId);
    if (!room || room.players.length < 2) return;
    startGame(room, gameType);
    if (gameType === "tarot") room.game.players = room.players.map(p => p.name);
    io.to(roomId).emit("game-started", { gameType: room.gameType, game: room.game, players: room.players });
  });
  socket.on("roll-dice", ({ roomId }) => {
    const room = getRoom(roomId); if (!room || !room.game) return;
    if (room.gameType === "ludo") { const r = rollLudo(room); io.to(roomId).emit("dice-rolled", { type: "ludo", ...r, turn: room.game.turn }); }
    else if (room.gameType === "dice") { const r = rollDice(room); io.to(roomId).emit("dice-rolled", { type: "dice", ...r }); }
  });
  socket.on("next-turn", ({ roomId }) => { const room = getRoom(roomId); if (!room) return; nextTurn(room); io.to(roomId).emit("turn-changed", { turn: room.game.turn }); });
  socket.on("pick-truth", ({ roomId, level }) => { const room = getRoom(roomId); if (!room) return; const q = pickTruthQuestion(room, level || "sweet"); io.to(roomId).emit("question-picked", { type: "truth", level: room.game.currentLevel, question: q }); });
  socket.on("pick-dare", ({ roomId, level }) => { const room = getRoom(roomId); if (!room) return; const q = pickDareQuestion(room, level || "normal"); io.to(roomId).emit("question-picked", { type: "dare", level: room.game.currentLevel, question: q }); });
  socket.on("compatibility-answer", ({ roomId, answer }) => {
    const room = getRoom(roomId); if (!room) return;
    const playerIdx = room.players.findIndex(p => p.id === socket.id);
    if (playerIdx < 0) return;
    compatibilityAnswer(room, playerIdx, answer);
    io.to(roomId).emit("compatibility-update", { currentIndex: room.game.currentIndex, score: room.game.score, answers: room.game.answers, myIndex: playerIdx, otherIndex: 1 - playerIdx, canAnswer: false });
  });
  socket.on("compatibility-next", ({ roomId }) => { const room = getRoom(roomId); if (!room) return; const r = compatibilityNext(room); if (r?.finished) io.to(roomId).emit("compatibility-update", { finished: true, score: room.game.score }); else io.to(roomId).emit("compatibility-update", { currentIndex: room.game.currentIndex, answers: [[], []], canAnswer: true }); });
  socket.on("tarot-draw", ({ roomId }) => { const room = getRoom(roomId); if (!room) return; tarotDraw(room); io.to(roomId).emit("tarot-update", { cards: room.game.cards, players: room.players.map(p => p.name) }); });
  socket.on("draw-stroke", ({ roomId, data }) => { const room = getRoom(roomId); if (!room) return; const r = drawAddStroke(room, data); socket.to(roomId).emit("draw-update", r); });
  socket.on("draw-guess", ({ roomId, guess }) => { const room = getRoom(roomId); if (!room) return; const playerIdx = room.players.findIndex(p => p.id === socket.id); const r = drawGuess(room, playerIdx, guess); if (r) io.to(roomId).emit("draw-update", { ...r, correctCount: room.game.correctCount }); });
  socket.on("draw-next", ({ roomId }) => { const room = getRoom(roomId); if (!room) return; const r = drawNext(room); io.to(roomId).emit("draw-update", r); });
  socket.on("karaoke-score", ({ roomId, score }) => { const room = getRoom(roomId); if (!room) return; const playerIdx = room.players.findIndex(p => p.id === socket.id); karaokeScore(room, playerIdx, score); if (room.game.scored[0] && room.game.scored[1]) { io.to(roomId).emit("tarot-update", { type: "karaoke-done", scores: room.game.scores, nextSong: (room.game.songIndex + 1) % 4 }); room.game.songIndex = (room.game.songIndex + 1) % 4; room.game.scored = [false, false]; room.game.scores = [0, 0]; io.to(roomId).emit("game-started", { gameType: "karaoke", game: room.game, players: room.players }); } else { io.to(roomId).emit("tarot-update", { type: "karaoke-partial", scored: room.game.scored, scores: room.game.scores }); } });
  socket.on("danmaku", ({ roomId, text }) => { io.to(roomId).emit("danmaku", { id: Date.now() + Math.random(), text, color: "#fff5f7", textColor: "#ff4787" }); });
  socket.on("restart-game", ({ roomId }) => { const room = getRoom(roomId); if (!room) return; room.started = false; room.game = null; room.gameType = null; io.to(roomId).emit("game-restarted", { players: room.players }); });
  socket.on("disconnect", () => {
    for (const r of io.sockets.adapter.rooms) {
      const room = getRoom(r.id);
      if (room) {
        const before = room.players.length;
        removePlayer(room, socket.id);
        if (room.players.length !== before || room.spectators.length === 0) io.to(r.id).emit("room-update", { players: room.players, spectators: room.spectators, started: room.started, gameType: room.gameType });
      }
    }
    console.log(`[-] ${socket.id}`);
  });
});
server.listen(PORT, () => { console.log(`[TangDou] Server ready`); console.log(`  Web app:    http://localhost:${PORT}`); console.log(`  API health: http://localhost:${PORT}/api/health`); });
