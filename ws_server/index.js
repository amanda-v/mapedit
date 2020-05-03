const app = require("http").createServer();
const io = require("socket.io")(app);
const fs = require("fs");

app.listen(8080);

io.on("connection", (socket) => {
  socket.emit("connected_server", { msg: "connected to the server" });
  socket.on("npc_client", (data) => {
    console.log("msg from the npc :", data.msg);
    socket.emit("npc_server", {
      msg: "message to npc client from the server",
    });
  });
  socket.on("player_client", (data) => {
    console.log("msg from the player :", data.msg);
    socket.emit("player_server", {
      msg: "message to player client from the server",
    });
  });
});
