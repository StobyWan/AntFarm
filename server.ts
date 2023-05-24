import { AntSimulator } from './AntSimulator';
import WebSocket from "ws";

let wss = new WebSocket.Server({ port: 8080 });
wss.on("connection", (ws) => {
  let simulator = new AntSimulator(10, 10);
  setInterval(() => {
    simulator.step();
    ws.send(JSON.stringify(simulator.getState()));
  }, 500);
});
