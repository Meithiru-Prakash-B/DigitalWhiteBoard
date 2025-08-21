const port = process.env.PORT || 5000;
const io = require("socket.io")(port, {
  cors: {
    origin: "*", // <- ALLOW ALL ORIGINS (safe for dev only)
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User online");

  socket.on("canvas-data", (data) => {
    socket.broadcast.emit("canvas-data", data);
  });
});