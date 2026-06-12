// 默契挑战：同题作答，答案一致加心心
const QUESTIONS = [
  { q: "对方最讨厌的食物是？", options: ["香菜", "苦瓜", "肥肉", "折耳根"] },
  { q: "对方最怕什么小动物？", options: ["蜘蛛", "蛇", "蟑螂", "老鼠"] },
  { q: "对方的第一反应是道歉还是讲道理？", options: ["先道歉", "先讲道理", "看心情"] },
  { q: "对方睡觉习惯是？", options: ["一碰就醒", "雷打不动", "抱着东西睡", "踢被子"] },
  { q: "你们在一起多久了？", options: ["不到 1 年", "1-3 年", "3-5 年", "5 年以上"] },
  { q: "对方最常用的口头禅是？", options: ["嗯嗯", "没事", "随便", "好的"] },
  { q: "对方生气时最想要的是？", options: ["抱抱", "冷静一下", "讲清楚", "吃点东西"] },
  { q: "对方最喜欢的季节是？", options: ["春", "夏", "秋", "冬"] },
  { q: "对方手机里 APP 最多的是？", options: ["社交", "游戏", "视频", "购物"] },
  { q: "对方最想和你一起做的是？", options: ["旅行", "做饭", "看电影", "宅家"] }
];

export default function Compatibility({ game, onAnswer, onNext, onRestart }) {
  const idx = game?.currentIndex ?? 0;
  const q = QUESTIONS[idx];
  const myAns = game?.answers?.[game?.myIndex]?.[idx];
  const otherAns = game?.answers?.[game?.otherIndex]?.[idx];
  const bothAnswered = myAns !== undefined && otherAns !== undefined;
  const matched = bothAnswered && myAns === otherAns;
  const finished = idx >= QUESTIONS.length;

  if (finished) {
    const score = game.score ?? 0;
    return (
      <div className="card text-center space-y-3">
        <div className="text-6xl">💞</div>
        <h3 className="text-2xl font-extrabold text-candy-600">默契分: {score} / {QUESTIONS.length}</h3>
        <p className="text-gray-600">
          {score >= 8 ? "简直天作之合 ✨" : score >= 5 ? "默契不错 💕" : "还需要多聊聊 🍬"}
        </p>
        <div className="flex gap-2 justify-center pt-2">
          <button className="btn-primary" onClick={onNext}>再来一轮</button>
          <button className="btn-secondary" onClick={onRestart}>换游戏</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-700">💞 默契挑战</h3>
        <div className="text-sm text-mint-600">第 {idx + 1} / {QUESTIONS.length} 题</div>
      </div>

      <div className="text-lg font-bold text-gray-800 text-center py-4">{q.q}</div>

      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt, i) => {
          const isMy = myAns === i;
          const isOther = otherAns === i;
          return (
            <button
              key={i}
              disabled={myAns !== undefined || !game?.canAnswer}
              onClick={() => onAnswer(i)}
              className={`p-3 rounded-2xl border-2 font-bold transition ${
                isMy ? "bg-candy-100 border-candy-400 text-candy-700" :
                isOther ? "bg-mint-100 border-mint-400 text-mint-700" :
                "border-gray-200 hover:border-candy-300"
              }`}
            >
              {opt}
              {isMy && <span className="ml-1 text-xs">（我）</span>}
              {isOther && <span className="ml-1 text-xs">（TA）</span>}
            </button>
          );
        })}
      </div>

      {bothAnswered && (
        <div className={`text-center py-3 rounded-2xl font-bold ${matched ? "bg-candy-100 text-candy-600" : "bg-gray-100 text-gray-600"}`}>
          {matched ? "💕 心有灵犀！" : "💔 答案不同"}
        </div>
      )}

      {bothAnswered && (
        <button className="btn-primary w-full" onClick={onNext}>
          {idx + 1 >= QUESTIONS.length ? "看结果" : "下一题 →"}
        </button>
      )}

      {!bothAnswered && (
        <div className="text-center text-sm text-gray-400">
          {myAns === undefined ? "选你的答案" : "等待对方作答..."}
        </div>
      )}
    </div>
  );
}
