import { io } from "socket.io-client";
// import { BASE_URL } from "./constants";

export const socket = io("http://localhost:3001", {
  withCredentials: true,
  autoConnect: false,
});
