const WebSocket = require("ws");
var portNum = 8080;
const ws = new WebSocket.Server({ port: portNum });
console.log("server listening on port: ", portNum);
ws.on("connection", (ws) => {
  ws.on("message", (message) => {
    console.log(`Received message => ${message}`);
  });
  ws.send("connected to ws server!");
});
