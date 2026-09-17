import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
  if (socket) return socket;

  const token = localStorage.getItem("token");
  socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
    auth: { token },
    autoConnect: true,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
