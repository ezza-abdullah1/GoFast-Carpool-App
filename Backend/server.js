const express  = require("express");
const cors     = require("cors");
const morgan   = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const http     = require("http");

const carpoolRoutes = require("./routes/carpoolRoutes");
const mapRoutes     = require("./routes/mapRoutes");
const authRoutes = require("./routes/auth");

dotenv.config();
connectDB();

const apiRoutes     = require("./routes/index.js");            // <-- our new index.js
const { init: initSocket } = require("./socket");     // create this file as below

const app    = express();
const server = http.createServer(app);
const io     = initSocket(server);

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// attach io to requests so controllers can emit
app.use((req, _, next) => {
  req.io = io;
  next();
});

// Your existing routes
app.use("/api/carpools", carpoolRoutes);
app.use("/api/map",      mapRoutes);

// New messaging API
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("Carpool API is running");
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
