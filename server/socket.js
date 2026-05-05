import { Server } from "socket.io";

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, { cors: { origin: "*" } });
  return io;
}

export function getIo() {
  return io;
}
