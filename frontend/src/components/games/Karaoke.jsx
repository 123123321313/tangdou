import { useEffect, useRef, useState } from "react";

const SONGS = [
  { title: "小幸运", artist: "田馥甄", bpm: 76,
    lyrics: [
      "我听见雨滴落在青青草地",
      "我听见远方下课钟声响起",
      "可是我没有听见你的声音",
      "认真呼唤我姓名",
      "爱你怎么会是这种距离",
      "原来你是我最想留住的幸运",
      "原来我们和爱情曾经靠得那么近"
    ]},
  { title: "告白气球", artist: "周杰伦", bpm: 95,
    lyrics: [
      "塞纳河畔 左岸的咖啡",
      "我手一杯 品尝你的美",
      "留下唇印的嘴",
      "花店玫瑰 名字写错谁",
      "告白气球 风吹到对街",
      "微笑在天上飞"
    ]},
  { title: "恋爱循环", artist: "花泽香菜", bpm: 130,
    lyrics: [
      "せーの",
      "でもねそんな日も",
      "ちゃんとサヨナラ",
      "また明日ねって",
      "そんな言葉で",
      "今日の私が終わる",
      "明日もがんばるよ"
    ]},
  { title: "简单爱", artist: "周杰伦", bpm: 88,
    lyrics: [
      "说不上为什么 我变得很主动",
      "若爱上一个人 什么都会值得去做",
      "我想大声宣布 对你依依不舍",
      "连隔壁邻居都猜到我现在的感受"
    ]}
];

export default function Karaoke({ game, onScore, onRestart }) {
  const [line, setLine] = useState(0);
  const [scoreGiven, setScoreGiven] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    setLine(0);
    setScoreGiven(null);
    if (game?.songIndex === undefined) return;
    const song = SONGS[game.songIndex];
    if (!song) return;
    const interval = Math.max(2500, 60000 / song.bpm * 2);
    timer.current = setInterval(() => {
      setLine(l => {
        if (l + 1 >= song.lyrics.length) { clearInterval(timer.current); return l; }
        return l + 1;
      });
    }, interval);
    return () => clearInterval(timer.current);
  }, [game?.songIndex]);

  const song = game?.songIndex !== undefined ? SONGS[game.songIndex] : null;

  const giveScore = (s) => {
    setScoreGiven(s);
    onScore(s);
  };

  if (!song) {
    return (
      <div className="card text-center py-10">
        <div className="text-5xl mb-3">🎤</div>
        <p className="text-gray-600">等待对方选歌...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-gray-400">正在演唱</div>
            <div className="text-xl font-extrabold text-candy-600">{song.title}</div>
            <div className="text-xs text-gray-500">{song.artist}</div>
          </div>
          <button onClick={onRestart} className="text-xs text-gray-400">换游戏</button>
        </div>

        <div className="bg-gradient-to-br from-candy-50 to-mint-50 rounded-2xl p-4 min-h-[160px] flex items-center justify-center">
          <div className="text-center space-y-1">
            {line > 0 && <div className="text-sm text-gray-400">{song.lyrics[line - 1]}</div>}
            <div className="text-xl font-bold text-candy-600 animate-pulse">{song.lyrics[line]}</div>
            {line + 1 < song.lyrics.length && <div className="text-sm text-gray-400">{song.lyrics[line + 1]}</div>}
          </div>
        </div>

        <div className="mt-3 text-center text-xs text-gray-400">
          🎵 {line + 1} / {song.lyrics.length} · {scoreGiven ? "已评分" : "唱完互评一下"}
        </div>
      </div>

      {line + 1 >= song.lyrics.length && !scoreGiven && (
        <div className="card">
          <div className="text-center text-sm text-gray-600 mb-3">给对方这一轮的表现打个分</div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { s: 10, label: "🎤 天籁", color: "bg-candy-500" },
              { s: 7, label: "😄 不错", color: "bg-mint-500" },
              { s: 4, label: "🙂 还行", color: "bg-yellow-500" },
              { s: 1, label: "😂 跑调", color: "bg-gray-400" }
            ].map(o => (
              <button key={o.s} onClick={() => giveScore(o.s)} className={`p-3 rounded-2xl text-white font-bold ${o.color} active:scale-95 transition`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {scoreGiven && (
        <div className="card text-center space-y-2">
          <div className="text-3xl">🎉</div>
          <p className="text-gray-600">已给出 {scoreGiven} 分</p>
          <p className="text-xs text-gray-400">等对方也评完，自动换下一首</p>
        </div>
      )}
    </div>
  );
}
