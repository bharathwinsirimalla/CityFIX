import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_ORIGIN || "http://localhost:5000";

let socket;

export const connectSocket = (token) => {
  if (!token) return null;

  if (!socket) {
    socket = io(socketUrl, {
      auth: { token },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
  }

  if (socket.auth?.token !== token) {
    socket.auth = { token };
    if (socket.connected) {
      socket.disconnect();
    }
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

