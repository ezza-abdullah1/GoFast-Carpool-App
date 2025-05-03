// 2. Update socket.js - Improve socket initialization with better CORS
// Update your socket.js file in the backend

const socketIo = require("socket.io");
let io;

exports.init = (server, corsOptions) => {
  io = socketIo(server, { 
    cors: corsOptions || { 
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'], // Enable multiple transports
    pingTimeout: 30000, // Increase timeout
    pingInterval: 10000 // Ping more frequently
  });
  
  io.on("connection", socket => {
    console.log("Client connected:", socket.id);
    
    // Notify the client that connection is established
    socket.emit("connected", { status: "connected" });
    
    socket.on("join", conversationId => {
      console.log(`Client ${socket.id} joined conversation: ${conversationId}`);
      socket.join(conversationId);
      // Confirm the join to the client
      socket.emit("joined", { conversationId });
    });
    
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
    
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });
  
  io.on("connect_error", (err) => {
    console.error("Socket.IO connection error:", err);
  });
  
  return io;
};

exports.getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};