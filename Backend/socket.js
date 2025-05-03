const socketIo = require("socket.io");
let io;

exports.init = (server) => {
  io = socketIo(server, { cors: { origin: "*" } });
  io.on("connection", socket => {
    console.log("Client connected:", socket.id);
    socket.on("join", conversationId => {
      socket.join(conversationId);
    });
  });
  return io;
};

exports.getIO = () => io;
