const express  = require("express");
const cors     = require("cors");
const morgan   = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const apiRoutes     = require("./routes/index.js");            // <-- our new index.js
const carpoolHistoryRoutes = require("./routes/carpoolHistoryRoutes.js");

const http     = require("http");

const carpoolRoutes = require("./routes/carpoolRoutes");
const mapRoutes     = require("./routes/mapRoutes");
const signinRoutes = require("./controllers/signinController");
const stopsRoutes = require("./routes/stopRoutes.js");  
const userRoutes = require("./routes/userRoutes.js"); 
dotenv.config();
connectDB();


const { init: initSocket } = require("./socket");     // create this file as below

const app    = express();
const server = http.createServer(app);
const io     = initSocket(server);

const PORT = process.env.PORT || 5000;
// Middleware

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.json()); // To parse JSON requests


// attach io to requests so controllers can emit
app.use((req, _, next) => {
  req.io = io;
  next();
});
app.use("/api/contacts", apiRoutes);
// Your existing routes
app.use("/api/carpools", carpoolRoutes);
app.use("/api/map",      mapRoutes);
app.use("/api/auth", signinRoutes);
app.use("/api/carpools/history",carpoolHistoryRoutes);
app.use("/api/stop",stopsRoutes);
app.use("/api/user",userRoutes );
app.use('/api/', carpoolRoutes);
// New messaging API+ auth
app.use("/api/messages", apiRoutes);

app.get("/", (req, res) => {
  res.send("Carpool API is running");
});


// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
