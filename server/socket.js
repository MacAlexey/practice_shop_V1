import { Server } from "socket.io";

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      socket.join(`user:${userId}`);
    });
  });

  return io;
}

export function getIo() {
  return io;
}
