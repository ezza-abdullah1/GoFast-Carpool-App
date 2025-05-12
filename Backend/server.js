const express  = require("express");
const cors     = require("cors");
const morgan   = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const apiRoutes     = require("./routes/index.js");          
const carpoolHistoryRoutes = require("./routes/carpoolHistoryRoutes.js");


const http     = require("http");

const carpoolRoutes = require("./routes/carpoolRoutes");
const mapRoutes     = require("./routes/mapRoutes");
const signinRoutes = require("./controllers/signinController");
const stopsRoutes = require("./routes/stopRoutes.js");  
const userRoutes = require("./routes/userRoutes.js"); 
const signupRouter = require("./controllers/authController").router;
const verifyTempUserRouter = require("./controllers/verifyTempUser");
const forgotPasswordRoutes = require("./controllers/forgotPasswordController");
const verifyCodeRoutes = require("./controllers/verifyResetCodeController");
const resetPasswordRoutes = require("./controllers/resetPasswordController");
dotenv.config();
connectDB();


const { init: initSocket } = require("./socket");  

const app    = express();
const server = http.createServer(app);
const io     = initSocket(server);

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.json());


app.use((req, _, next) => {
  req.io = io;
  next();
});
app.use("/api/carpools", carpoolRoutes);
app.use("/api/map",      mapRoutes);
app.use("/api/auth", signinRoutes);
app.use("/api/carpools/history",carpoolHistoryRoutes);
app.use("/api/stop",stopsRoutes);
app.use("/api/user",userRoutes );
app.use('/api/', carpoolRoutes);

app.use("/api", apiRoutes);
app.use("/api/auth", signupRouter);            
app.use("/api/auth", verifyTempUserRouter);    
app.use("/api/auth", forgotPasswordRoutes);
app.use("/api/auth", verifyCodeRoutes);
app.use("/api/auth", resetPasswordRoutes);

app.get("/", (req, res) => {
  res.send("Carpool API is running");
});


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
