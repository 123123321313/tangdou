import { customAlphabet } from "nanoid";
import { ludoEvents, diceActions, getTruth, getDare, compatibilityQuestions, tarotCards, getTarot, getDrawWord } from "./questions.js";

const newId = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 6);
const rooms = new Map();

export function createRoom(opts = {}) {
  let id;
  do { id = newId(); } while (rooms.has(id));
  const room = {
    id,
    createdAt: Date.now(),
    password: opts.password || null,
    players: [],
    spectators: [],
    game: null,
    gameType: null,
    started: false
  };
  rooms.set(id, room);
  return room;
}

export function getRoom(id) { return rooms.get(id); }
export function deleteRoom(id) { rooms.delete(id); }

export function addPlayer(room, { id, name, socketId, password }) {
  if (room.players.length >= 2) return { error: "房间已满" };
  if (room.password && room.password !== password) return { error: "密码错误" };
  // 断线重连：如果同名玩家已存在，复用其位置
  const existing = room.players.find(p => p.name === name);
  if (existing) {
    existing.id = id; existing.socketId = socketId; existing.connected = true;
    return existing;
  }
  const player = { id, name: name || "糖豆", socketId, pos: 0, connected: true, avatar: null };
  room.players.push(player);
  return player;
}

export function addSpectator(room, { id, name, socketId, password }) {
  if (room.password && room.password !== password) return { error: "密码错误" };
  const spec = { id, name: name || "观众", socketId };
  room.spectators.push(spec);
  return spec;
}

export function removePlayer(room, socketId) {
  // 标记为断线，不立即删除（30 秒内可重连）
  const p = room.players.find(x => x.socketId === socketId);
  if (p) {
    p.connected = false;
    p.disconnectedAt = Date.now();
    setTimeout(() => {
      if (room.players.find(x => x.socketId === socketId && !x.connected)) {
        room.players = room.players.filter(x => x.socketId !== socketId);
        if (room.players.length === 0) deleteRoom(room.id);
      }
    }, 30000);
  }
  room.spectators = room.spectators.filter(s => s.socketId !== socketId);
  if (room.players.length === 0 && room.spectators.length === 0) deleteRoom(room.id);
}

export function startGame(room, gameType) {
  room.gameType = gameType;
  room.started = true;
  if (gameType === "ludo") room.game = { turn: 0, positions: room.players.map(() => 0), lastDice: null, lastEvent: null, winner: null, log: [] };
  else if (gameType === "truth") room.game = { currentLevel: "sweet", currentQuestion: getTruth("sweet"), lastChooser: 0, log: [] };
  else if (gameType === "dice") room.game = { lastRoll: null, lastAction: null, log: [] };
  else if (gameType === "compatibility") room.game = { currentIndex: 0, answers: [[], []], score: 0, finished: false };
  else if (gameType === "tarot") room.game = { cards: [getTarot(), getTarot()], log: [] };
  else if (gameType === "draw") {
    const word = getDrawWord();
    room.game = { round: 0, drawer: 0, word, strokes: [], guessed: false, correctCount: 0, finished: false };
  }
  else if (gameType === "karaoke") room.game = { songIndex: Math.floor(Math.random() * 4), scores: [0, 0], scored: [false, false] };
  return room.game;
}

export function rollLudo(room) {
  if (!room.game || room.gameType !== "ludo") return null;
  const dice = 1 + Math.floor(Math.random() * 6);
  const turn = room.game.turn;
  room.game.lastDice = dice;
  room.game.positions[turn] = Math.min(30, room.game.positions[turn] + dice);
  if (room.game.positions[turn] >= 30) { room.game.winner = turn; return { dice, winner: turn }; }
  const cellIndex = (room.game.positions[turn] - 1) % ludoEvents.length;
  const event = ludoEvents[cellIndex];
  room.game.lastEvent = event;
  if (event.type === "reward" && event.text.includes("前进")) room.game.positions[turn] = Math.min(30, room.game.positions[turn] + 2);
  else if (event.type === "punish" && event.text.includes("后退")) room.game.positions[turn] = Math.max(0, room.game.positions[turn] - 1);
  else if (event.type === "swap") {
    const other = 1 - turn; const tmp = room.game.positions[turn];
    room.game.positions[turn] = room.game.positions[other]; room.game.positions[other] = tmp;
  }
  return { dice, event, positions: [...room.game.positions] };
}

export function nextTurn(room) { if (room.gameType === "ludo") room.game.turn = 1 - room.game.turn; }
export function pickTruthQuestion(room, level) { room.game.currentLevel = level; room.game.currentQuestion = getTruth(level); return room.game.currentQuestion; }
export function pickDareQuestion(room, level) { room.game.currentLevel = level; room.game.currentQuestion = getDare(level); return room.game.currentQuestion; }
export function rollDice(room) { if (room.gameType !== "dice") return null; const roll = 1 + Math.floor(Math.random() * 6); room.game.lastRoll = roll; room.game.lastAction = diceActions[roll - 1]; return { roll, action: room.game.lastAction }; }
export function compatibilityAnswer(room, playerIdx, answerIdx) {
  if (room.gameType !== "compatibility" || room.game.finished) return null;
  const idx = room.game.currentIndex; room.game.answers[playerIdx][idx] = answerIdx;
  const a0 = room.game.answers[0][idx], a1 = room.game.answers[1][idx];
  if (a0 !== undefined && a1 !== undefined && a0 === a1) room.game.score += 1;
  return { a0, a1, score: room.game.score };
}
export function compatibilityNext(room) {
  if (room.gameType !== "compatibility") return null;
  if (room.game.currentIndex + 1 >= compatibilityQuestions.length) { room.game.finished = true; return { finished: true, score: room.game.score }; }
  room.game.currentIndex += 1; return { currentIndex: room.game.currentIndex };
}
export function tarotDraw(room) { if (room.gameType !== "tarot") return null; room.game.cards = [getTarot(), getTarot()]; return room.game.cards; }
export function drawAddStroke(room, strokeData) {
  if (room.gameType !== "draw") return null;
  if (strokeData.type === "clear") { room.game.strokes = [{ type: "clear" }]; return { strokes: room.game.strokes }; }
  if (strokeData.type === "end") { room.game.strokes.push({ type: "end" }); return { strokes: room.game.strokes }; }
  const last = room.game.strokes[room.game.strokes.length - 1];
  if (last && last.type === "draw" && last.color === strokeData.color) last.points.push(strokeData.point);
  else room.game.strokes.push({ type: "draw", color: strokeData.color, points: [strokeData.point] });
  return { strokes: room.game.strokes };
}
export function drawGuess(room, playerIdx, guess) {
  if (room.gameType !== "draw" || room.game.guessed) return null;
  if (guess === room.game.word) { room.game.guessed = true; room.game.correctCount += 1; return { guessed: true, word: room.game.word }; }
  return { guessed: false };
}
export function drawNext(room) {
  if (room.gameType !== "draw") return null;
  room.game.round += 1; room.game.drawer = 1 - room.game.drawer; room.game.word = getDrawWord();
  room.game.strokes = []; room.game.guessed = false; room.game.finished = room.game.round >= 4;
  return { round: room.game.round, drawer: room.game.drawer, word: room.game.word, finished: room.game.finished };
}
export function karaokeScore(room, playerIdx, score) {
  if (room.gameType !== "karaoke") return null;
  room.game.scores[playerIdx] = score; room.game.scored[playerIdx] = true;
  return { scores: room.game.scores, scored: room.game.scored };
}
