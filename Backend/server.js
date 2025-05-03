const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const carpoolRoutes = require("./routes/carpoolRoutes");
const mapRoutes = require("./routes/mapRoutes");
const authRoutes = require("./routes/auth");

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/carpools", carpoolRoutes);
app.use("/api/map", mapRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Carpool API is running");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
