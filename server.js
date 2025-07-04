const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const Server = require("socket.io");
const router = require("./routes/userRoutes");
const socketIo = require("./socket");
const cors = require("cors");
const groupRouter = require("./routes/groupRoutes");
const messageRouter = require("./routes/chatRoutes");
dotenv.config();

const app = express();
const corsOptions = {
  origin: [
    "http://localhost:5173", // local dev frontend
    "https://chat-app-frontend-tau-lac.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

const server = http.createServer(app);
const io = Server(server, {
  cors: {
    // origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log("error connecting to db");
  });

socketIo(io);

app.use("/api/users", router);
app.use("/api/groups", groupRouter);
app.use("/api/messages", messageRouter);

server.listen(process.env.PORT || 3000, () => {
  console.log(`server running at ${process.env.PORT}`);
});
