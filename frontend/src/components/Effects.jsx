import { useEffect, useState } from "react";

// 入场粒子动画（💕 汇聚成标题）
export function ParticleEntry({ onDone }) {
  const [particles, setParticles] = useState(() => Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 0.5,
    emoji: ["💕", "✨", "🍬", "💗", "🌸"][i % 5]
  })));
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 1800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {particles.map(p => (
        <span
          key={p.id}
          className="absolute text-3xl animate-ping"
          style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${p.delay}s`, animationDuration: "1.2s" }}
        >{p.emoji}</span>
      ))}
    </div>
  );
}

// 胜利特效（花瓣 + 烟花）
export function Confetti({ active }) {
  if (!active) return null;
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1.5,
    emoji: ["🎉", "🎊", "💕", "✨", "🌸", "💖", "🍬"][i % 7],
    size: 16 + Math.random() * 16
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <span
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: "-30px",
            fontSize: `${p.size}px`,
            animation: `fall ${p.duration}s ease-in ${p.delay}s forwards`
          }}
        >{p.emoji}</span>
      ))}
      <style>{`@keyframes fall { to { transform: translateY(110vh) rotate(720deg); opacity: 0.3; } }`}</style>
    </div>
  );
}

// 弹幕层（飘过屏幕的双方文字）
export function Danmaku({ messages, onSend }) {
  const [text, setText] = useState("");
  const [active, setActive] = useState(() => new Set(messages?.map(m => m.id) || []));
  useEffect(() => {
    if (!messages) return;
    setActive(prev => {
      const next = new Set(prev);
      messages.forEach(m => next.add(m.id));
      return next;
    });
    const t = setTimeout(() => setActive(new Set()), 6000);
    return () => clearTimeout(t);
  }, [messages]);

  const submit = (e) => {
    e?.preventDefault?.();
    if (text.trim()) { onSend?.(text.trim()); setText(""); }
  };

  return (
    <div className="fixed inset-x-0 top-20 pointer-events-none z-40">
      <div className="relative h-24 overflow-hidden">
        {(messages || []).map(m => active.has(m.id) && (
          <span
            key={m.id}
            className="absolute whitespace-nowrap text-sm font-bold px-3 py-1 rounded-full shadow"
            style={{
              background: m.color || "#fff",
              color: m.textColor || "#333",
              top: `${(m.id % 5) * 22}px`,
              animation: "dmfly 6s linear forwards"
            }}
          >{m.text}</span>
        ))}
      </div>
      <style>{`@keyframes dmfly { from { transform: translateX(100vw); } to { transform: translateX(-100%); } }`}</style>
      <form onSubmit={submit} className="pointer-events-auto flex gap-2 px-4 mt-2">
        <input
          className="input flex-1 text-sm py-1"
          placeholder="发条弹幕 ✨"
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={20}
        />
        <button type="submit" className="btn-primary py-1 px-3 text-sm">发</button>
      </form>
    </div>
  );
}
