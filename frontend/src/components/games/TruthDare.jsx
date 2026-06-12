import { useState } from "react";

const LEVELS = {
  truth: [
    { k: "sweet", label: "甜蜜", emoji: "🍬" },
    { k: "spicy", label: "暧昧", emoji: "🌶️" },
    { k: "wild", label: "刺激", emoji: "🔥" }
  ],
  dare: [
    { k: "normal", label: "普通", emoji: "😊" },
    { k: "spicy", label: "暧昧", emoji: "🌶️" },
    { k: "wild", label: "大胆", emoji: "🔥" }
  ]
};

export default function TruthDare({ game, onTruth, onDare, onRestart }) {
  const [mode, setMode] = useState("truth");

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-700">💬 真心话大冒险</h3>
          <button onClick={onRestart} className="text-xs text-gray-400">换游戏</button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setMode("truth")}
            className={`py-3 rounded-2xl font-bold transition ${mode === "truth" ? "bg-candy-500 text-white" : "bg-gray-100 text-gray-500"}`}
          >💬 真心话</button>
          <button
            onClick={() => setMode("dare")}
            className={`py-3 rounded-2xl font-bold transition ${mode === "dare" ? "bg-mint-500 text-white" : "bg-gray-100 text-gray-500"}`}
          >🔥 大冒险</button>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-500 text-center">选择难度</div>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS[mode].map(l => (
              <button
                key={l.k}
                onClick={() => mode === "truth" ? onTruth(l.k) : onDare(l.k)}
                className="p-3 rounded-2xl bg-white border-2 border-candy-100 hover:border-candy-400 active:scale-95 transition"
              >
                <div className="text-2xl">{l.emoji}</div>
                <div className="text-sm font-bold text-gray-700">{l.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card min-h-[160px] flex flex-col items-center justify-center text-center">
        {game?.currentQuestion ? (
          <>
            <div className="text-xs text-gray-400 mb-2">
              {game.currentType === "dare" ? "大冒险" : "真心话"} · {game.currentLevel}
            </div>
            <div className="text-xl font-bold text-gray-800 leading-relaxed">
              {game.currentQuestion}
            </div>
          </>
        ) : (
          <div className="text-gray-400">点击上方按钮抽一题吧 🎯</div>
        )}
      </div>
    </div>
  );
}

