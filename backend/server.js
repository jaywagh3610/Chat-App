const express = require("express");
const cookieParser = require("cookie-parser");
const connectDB = require("./models/db");
const registerRouter = require("./router/registerRouter");
const messageRouter = require("./router/messageRouter");
const heavyRouter = require("./router/heavyRouter");
const cors = require("cors");
const { app, server } = require("./ScoketIo/socketIo");
connectDB();

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend origin
    credentials: true, // Allow cookies to be sent
  })
);
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use("/register", registerRouter);
app.use("/message", messageRouter);
app.use("/worker", heavyRouter);

server.listen(3000, () => {
  console.log("The server is running on port 3000");
});
