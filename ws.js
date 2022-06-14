const WebSocket = require("ws")

module.exports = (expressServer) => {
  const websocketServer = new WebSocket.Server({
    noServer: true,
    path: "/ws",
  });

  expressServer.on("upgrade", (request, socket, head) => {
    websocketServer.handleUpgrade(request, socket, head, (websocket) => {
      websocketServer.emit("connection", websocket, request);
    });
  });

  return websocketServer;
};
