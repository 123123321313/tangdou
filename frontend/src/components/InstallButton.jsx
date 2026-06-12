import { useState, useEffect } from "react";

// 安装按钮组件：处理 Android/Chrome 的 beforeinstallprompt 和 iOS 的 Add to Home Screen 指引
export default function InstallButton() {
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    // 检测是否已经安装（standalone 模式）
    try {
      if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true) {
        setInstalled(true);
        return;
      }
    } catch (e) {}

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      setShowTip(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // iOS 检测
    const ua = (navigator.userAgent || "").toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);
    if (isIOS) setShowIOS(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const install = async () => {
    if (deferred) {
      deferred.prompt();
      const r = await deferred.userChoice;
      if (r.outcome === "accepted") {
        setInstalled(true);
        setDeferred(null);
      } else {
        setDeferred(null);
      }
    } else {
      setShowTip(true);
    }
  };

  if (showIOS) {
    return (
      <div className="card space-y-3">
        <div className="text-center">
          <div className="text-5xl mb-2">📱</div>
          <h3 className="text-lg font-extrabold text-candy-600">添加到主屏幕</h3>
          <p className="text-sm text-gray-600 mt-1">iOS 暂时不能一键安装，按下面步骤操作：</p>
        </div>
        <ol className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2"><span className="text-candy-500 font-bold">1.</span><span>点底部分享按钮 <span className="inline-block px-2 py-0.5 bg-gray-100 rounded">⎋</span>（方框+向上箭头）</span></li>
          <li className="flex items-start gap-2"><span className="text-candy-500 font-bold">2.</span><span>选择 <b>「添加到主屏幕」</b></span></li>
          <li className="flex items-start gap-2"><span className="text-candy-500 font-bold">3.</span><span>点右上角 <b>「添加」</b> 即可</span></li>
        </ol>
        <div className="text-center text-xs text-gray-400 mt-2">装好后桌面会出现 🍬 糖豆 图标，点开就是 app 模式</div>
      </div>
    );
  }

  return (
    <div className="card space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold text-candy-600">📲 安装糖豆 App</div>
          <div className="text-xs text-gray-500">装到桌面，离线也能玩</div>
        </div>
        <button onClick={install} className="px-4 py-2 bg-gradient-to-br from-candy-400 to-candy-500 text-white rounded-full font-bold shadow-md active:scale-95 transition">
          {deferred ? "安装" : "查看"}
        </button>
      </div>
      {showTip && !deferred && (
        <div className="text-xs text-gray-600 bg-candy-50 rounded-lg p-2">
          浏览器还没准备好，稍等几秒再点，或者用 Chrome 打开本站。
        </div>
      )}
    </div>
  );
}