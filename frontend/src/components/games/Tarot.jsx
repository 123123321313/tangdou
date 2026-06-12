// 抽签塔罗：两人各抽一张
const CARDS = [
  { name: "恋人", emoji: "💞", level: "大吉", text: "正位出现，象征真挚的爱与默契。今天很适合表白或加深感情。", color: "candy" },
  { name: "太阳", emoji: "☀️", level: "大吉", text: "光明、快乐、活力。今天和 TA 在一起会特别开心，笑容会很多。", color: "mint" },
  { name: "星星", emoji: "⭐", level: "大吉", text: "希望与灵感。你们的未来充满想象，记得和 TA 聊聊你的小梦想。", color: "candy" },
  { name: "世界", emoji: "🌍", level: "大吉", text: "圆满、成就。今天适合给关系定个小目标，比如一起做个相册。", color: "mint" },
  { name: "月亮", emoji: "🌙", level: "小吉", text: "有些情绪起伏。今晚适合和 TA 说说心里话，不要藏在心里。", color: "candy" },
  { name: "力量", emoji: "🦁", level: "小吉", text: "温柔地坚持。遇到分歧时，多一点耐心和包容。", color: "mint" },
  { name: "魔术师", emoji: "🎩", level: "中吉", text: "创造力爆棚。今天适合一起做点新鲜事，比如学做一道新菜。", color: "candy" },
  { name: "命运之轮", emoji: "🎡", level: "中吉", text: "缘分转动。也许会有小惊喜，比如收到 TA 的一条暖心消息。", color: "mint" },
  { name: "皇后", emoji: "👑", level: "中吉", text: "丰盛与滋养。今天可以给 TA 一个小礼物，不用贵，用心就好。", color: "candy" },
  { name: "战车", emoji: "🏇", level: "小凶", text: "冲动提醒。吵架时少说气话，给彼此一个台阶。", color: "mint" },
  { name: "倒吊人", emoji: "🙃", level: "小凶", text: "换个角度看。换个约会方式或话题，可能有意外收获。", color: "candy" },
  { name: "塔", emoji: "🗼", level: "中凶", text: "打破旧模式。可能是打破某些无意识的习惯，反而是好事。", color: "mint" }
];

function drawCard() {
  return CARDS[Math.floor(Math.random() * CARDS.length)];
}

export default function Tarot({ game, onDraw, onRestart }) {
  const hasDrawn = game?.cards && game.cards.length > 0;
  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-700">🔮 抽签塔罗</h3>
        <button onClick={onRestart} className="text-xs text-gray-400">换游戏</button>
      </div>

      {!hasDrawn ? (
        <div className="text-center py-10 space-y-4">
          <div className="text-7xl animate-pulse">🎴</div>
          <p className="text-gray-600">两人都准备好了吗？</p>
          <p className="text-xs text-gray-400">点击下方按钮，每人抽一张</p>
          <button onClick={onDraw} className="btn-primary text-lg px-10">✨ 抽签</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {game.cards.map((c, i) => (
            <div key={i} className={`p-4 rounded-2xl bg-${c.color}-50 border-2 border-${c.color}-200 text-center`}>
              <div className="text-5xl mb-2">{c.emoji}</div>
              <div className="font-extrabold text-lg text-gray-800">{c.name}</div>
              <div className="text-xs text-gray-500 mt-1">{game.players?.[i] || `玩家${i+1}`}</div>
              <div className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-bold ${c.level.includes("大吉") ? "bg-candy-500 text-white" : c.level.includes("小吉") || c.level.includes("中吉") ? "bg-mint-500 text-white" : "bg-gray-400 text-white"}`}>
                {c.level}
              </div>
              <p className="text-xs text-gray-600 mt-3 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      )}

      {hasDrawn && (
        <button onClick={onDraw} className="btn-secondary w-full">🔄 再抽一次</button>
      )}
    </div>
  );
}
