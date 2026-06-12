import { useMemo } from "react";

// 飞行棋 - 30格环形跑道（5列6行）
const BOARD_SIZE = 30;
const COLS = 6;
const ROWS = 5;

function cellPos(idx) {
  // idx 从 0 开始
  const i = idx % BOARD_SIZE;
  const row = Math.floor(i / COLS);
  const col = i % COLS;
  return { row, col };
}

export default function Ludo({ roomId, game, players, me, onRoll, onNext, onRestart }) {
  const myIdx = players.findIndex(p => p.id === me?.id);
  const myTurn = game.turn === myIdx;
  const winner = game.winner;

  const cells = useMemo(() => Array.from({ length: BOARD_SIZE }, (_, i) => cellPos(i)), []);

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-700">🎲 情侣飞行棋</h3>
          <button onClick={onRestart} className="text-xs text-gray-400">换游戏</button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {players.map((p, i) => (
            <div key={p.id} className={`p-3 rounded-2xl flex items-center gap-2 ${game.turn === i ? (i === 0 ? "bg-candy-100 ring-2 ring-candy-400" : "bg-mint-100 ring-2 ring-mint-400") : "bg-gray-50"}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${i === 0 ? "bg-candy-300" : "bg-mint-300"}`}>
                {i === 0 ? "💗" : "🍯"}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold">{p.name}</div>
                <div className="text-xs text-gray-500">第 {game.positions[i]} 格</div>
              </div>
              {winner === i && <span className="text-2xl">🏆</span>}
            </div>
          ))}
        </div>

        {/* 棋盘 */}
        <div className="relative bg-gradient-to-br from-candy-50 to-mint-50 rounded-2xl p-3" style={{ aspectRatio: `${COLS}/${ROWS}` }}>
          <div className="grid gap-1 h-full" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
            {cells.map((_, idx) => {
              const p0 = game.positions[0] - 1 === idx;
              const p1 = game.positions[1] - 1 === idx;
              return (
                <div key={idx} className="rounded-md bg-white/70 flex items-center justify-center text-xs relative overflow-hidden">
                  <span className="text-gray-300 text-[10px]">{idx + 1}</span>
                  {p0 && <span className="absolute text-lg">💗</span>}
                  {p1 && <span className="absolute text-lg">🍯</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 text-center">
          {winner !== null && winner !== undefined ? (
            <div className="space-y-2">
              <div className="text-2xl">🏆 {players[winner].name} 到达终点！</div>
              <button className="btn-primary" onClick={onRestart}>再来一局</button>
            </div>
          ) : (
            <>
              <div className="text-gray-500 mb-2 text-sm">
                {myTurn ? "🎯 轮到你掷骰子" : `⏳ 等待 ${players[game.turn].name} 掷骰子...`}
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  disabled={!myTurn}
                  onClick={onRoll}
                  className="btn-primary disabled:opacity-40 disabled:shadow-none"
                >
                  🎲 掷骰子
                </button>
                {game.lastEvent && myTurn && (
                  <button onClick={onNext} className="btn-secondary">下一回合 →</button>
                )}
              </div>
              {game.lastDice && (
                <div className="mt-3 inline-block px-4 py-2 bg-white rounded-full shadow text-2xl">
                  🎲 {game.lastDice}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {game.lastEvent && (
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">事件</div>
          <div className="font-bold text-lg">
            {game.lastEvent.type === "truth" && "💬 真心话"}
            {game.lastEvent.type === "dare" && "🔥 大冒险"}
            {game.lastEvent.type === "reward" && "✨ 奖励"}
            {game.lastEvent.type === "punish" && "😈 惩罚"}
            {game.lastEvent.type === "swap" && "🔄 互换"}
            {game.lastEvent.type === "birthday" && "🎂 特别事件"}
          </div>
          <div className="text-gray-700 mt-1">{game.lastEvent.text}</div>
        </div>
      )}
    </div>
  );
}

