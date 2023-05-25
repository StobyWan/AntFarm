import { AntSimulator } from "./AntSimulator";
import WebSocket from "ws";
import * as ULID from "ulid";

class GameServer {
  //   private simulator: AntSimulator;
  private wss: WebSocket.Server;
  private connections: any = {};

  constructor() {
    this.wss = new WebSocket.Server({ port: 8080 });

    this.wss.on("connection", (ws) => {
      console.log(ws);
      const id = ULID.ulid();
      this.connections[id] = ws;
      this.connections[id].simulator = new AntSimulator(10, 10);
      const intervalId = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
          this.connections[id].simulator.step();
          ws.send(
            JSON.stringify({
              id,
              state: this.connections[id].simulator.getState(id),
            })
          );
        } else {
          clearInterval(intervalId);
        }
      }, 500);

      ws.on("message", (message: string) => {
        let data = JSON.parse(message);
        console.log("data", data);
        if (data.parameter === "pheromone-strength") {
          this.connections[data.simId].simulator.setPheromoneStrength(data.value);
        } else if (data.parameter === "lifespan") {
          this.connections[data.simId].simulator.setLifespan(data.value);
        }
      });

      ws.on("close", () => {
        clearInterval(intervalId);
        delete this.connections[id];
      });
    });
  }
}

export const gameServer = new GameServer();
