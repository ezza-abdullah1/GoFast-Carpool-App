// backend/socket.js
const socketIo = require("socket.io");
let io;

exports.init = (server, corsOptions) => {
  io = socketIo(server, { 
    cors: corsOptions || { origin: "*", methods: ["GET", "POST"], credentials: true },
    transports: ['websocket','polling'],
    pingTimeout: 30000,
    pingInterval: 10000
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join", (conversationId) => {
      console.log(`Socket ${socket.id} joining room ${conversationId}`);
      socket.join(conversationId);
    });

    // Listen for sendMessage and broadcast only to others
    socket.on("sendMessage", (msg) => {
      const { conversationId } = msg;
      console.log(`Received sendMessage from ${socket.id} for room ${conversationId}`);
      socket.broadcast
        .to(conversationId)
        .emit("newMessage", msg);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });
  });

  return io;
};

exports.getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
