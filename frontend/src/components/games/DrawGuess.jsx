import { useEffect, useRef, useState } from "react";

const WORDS = ["猫", "狗", "苹果", "太阳", "房子", "汽车", "花", "鱼", "飞机", "气球", "雨伞", "冰淇淋", "月亮", "树", "杯子", "钥匙", "手机", "鞋子", "西瓜", "爱心", "蛋糕", "咖啡", "眼镜", "钢琴"];

const COLORS = ["#000000","#ff4787","#10b981","#3b82f6","#f59e0b","#8b5cf6"];

export default function DrawGuess({ game, players, me, onStroke, onGuess, onNext, onRestart }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const [guess, setGuess] = useState("");
  const [color, setColor] = useState("#000000");

  const myIdx = players.findIndex(p => p.id === me?.id);
  const drawerIdx = game?.drawer ?? 0;
  const isDrawer = myIdx === drawerIdx;
  const word = game?.word;
  const guessed = game?.guessed;
  const finished = game?.finished;

  useEffect(() => {
    if (!canvasRef.current) return;
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
  }, [game?.round]);

  useEffect(() => {
    if (!canvasRef.current || !game?.strokes) return;
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    game.strokes.forEach(s => drawStroke(ctx, s));
  }, [game?.strokes]);

  const drawStroke = (ctx, s) => {
    if (s.type === "clear") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      return;
    }
    ctx.strokeStyle = s.color || "#000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (s.points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(s.points[0].x, s.points[0].y);
    for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y);
    ctx.stroke();
  };

  const handleDown = (e) => {
    if (!isDrawer) return;
    drawing.current = true;
    const { x, y } = getXY(e);
    last.current = [x, y];
  };
  const handleMove = (e) => {
    if (!isDrawer || !drawing.current) return;
    const { x, y } = getXY(e);
    const c = canvasRef.current.getContext("2d");
    c.strokeStyle = color;
    c.lineWidth = 3;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(last.current[0], last.current[1]);
    c.lineTo(x, y);
    c.stroke();
    last.current = [x, y];
    onStroke({ type: "draw", color, point: { x, y } });
  };
  const handleUp = () => { drawing.current = false; onStroke({ type: "end" }); };

  const getXY = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches?.[0] || e;
    const x = ((t.clientX - rect.left) / rect.width) * canvasRef.current.width;
    const y = ((t.clientY - rect.top) / rect.height) * canvasRef.current.height;
    return { x, y };
  };

  const clear = () => onStroke({ type: "clear" });
  const submit = () => { if (guess.trim()) onGuess(guess.trim()); setGuess(""); };

  if (finished) {
    return (
      <div className="card text-center space-y-3">
        <div className="text-6xl">🎨</div>
        <h3 className="text-2xl font-extrabold text-candy-600">本轮结束</h3>
        <p className="text-gray-600">答案是：<span className="font-bold">{word}</span></p>
        <p className="text-gray-600">猜对次数：<span className="font-bold text-mint-600">{game.correctCount ?? 0}</span></p>
        <div className="flex gap-2 justify-center pt-2">
          <button className="btn-primary" onClick={onNext}>换人画</button>
          <button className="btn-secondary" onClick={onRestart}>换游戏</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-700">🎨 你画我猜</h3>
        <button onClick={onRestart} className="text-xs text-gray-400">换游戏</button>
      </div>

      <div className="flex items-center justify-between bg-mint-50 p-3 rounded-2xl">
        <div className="text-sm">
          {isDrawer ? (
            <>你的题目：<span className="font-extrabold text-candy-600 text-lg">{word}</span></>
          ) : (
            <>对方正在画... 猜猜是什么？</>
          )}
        </div>
        <div className="text-xs text-gray-500">{players[drawerIdx]?.name} 画</div>
      </div>

      <div className="relative bg-white rounded-2xl border-2 border-candy-100 overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          className="w-full h-full touch-none"
          onMouseDown={handleDown}
          onMouseMove={handleMove}
          onMouseUp={handleUp}
          onMouseLeave={handleUp}
          onTouchStart={handleDown}
          onTouchMove={handleMove}
          onTouchEnd={handleUp}
        />
        {!isDrawer && (
          <div className="absolute inset-0 pointer-events-none flex items-end p-2 text-xs text-gray-300">
            观察中
          </div>
        )}
      </div>

      {isDrawer && (
        <div className="flex gap-1 justify-center">
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? "border-gray-800 scale-110" : "border-gray-200"}`} style={{ background: c }} />
          ))}
          <button onClick={clear} className="px-3 py-1 rounded-full bg-gray-100 text-xs font-bold">清空</button>
        </div>
      )}

      {!isDrawer && (
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="你猜是什么？" value={guess} onChange={e => setGuess(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} maxLength={20} />
          <button className="btn-primary" onClick={submit}>猜</button>
        </div>
      )}

      {guessed && (
        <div className="text-center py-2 rounded-2xl bg-mint-100 text-mint-700 font-bold">
          ✅ 猜对啦！答案是「{word}」
        </div>
      )}
    </div>
  );
}
