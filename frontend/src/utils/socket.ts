import { io } from "socket.io-client";

export const socket = io(process.env.VITE_SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
});
