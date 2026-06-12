import { io } from "socket.io-client";

// 同源部署（dev 和 production 都用当前域名）
const URL = "/";

export const socket = io(URL, {
  autoConnect: true,
  transports: ["websocket", "polling"]
});

export function joinRoom(roomId, name) {
  return new Promise((resolve, reject) => {
    socket.emit("join-room", { roomId, name }, (resp) => {
      if (resp?.ok) resolve(resp);
      else reject(new Error(resp?.error || "join failed"));
    });
  });
}
