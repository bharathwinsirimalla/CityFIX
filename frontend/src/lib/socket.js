import { io } from "socket.io-client";
import { getSocketUrl } from "./config";

const socketUrl = getSocketUrl();

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

