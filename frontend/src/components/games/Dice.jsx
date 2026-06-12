export default function Dice({ game, onRoll, onRestart }) {
  return (
    <div className="space-y-4">
      <div className="card text-center">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-700">🎯 情侣骰子</h3>
          <button onClick={onRestart} className="text-xs text-gray-400">换游戏</button>
        </div>

        <div className="py-10">
          <div className={`text-9xl ${game?.lastRoll ? "animate-bounce" : ""}`}>
            {diceEmoji(game?.lastRoll)}
          </div>
          {game?.lastRoll && (
            <div className="mt-4 text-2xl font-extrabold text-candy-600">
              {game.lastRoll} 点
            </div>
          )}
        </div>

        <button onClick={onRoll} className="btn-primary text-lg px-10">
          🎯 掷骰子
        </button>
      </div>

      {game?.lastAction && (
        <div className="card text-center">
          <div className="text-sm text-gray-500 mb-1">本轮任务</div>
          <div className="text-lg font-bold text-gray-800">{game.lastAction}</div>
        </div>
      )}
    </div>
  );
}

function diceEmoji(n) {
  return ["⚀","⚁","⚂","⚃","⚄","⚅"][(n || 0) - 1] || "🎲";
}

