class FoodSource {
  constructor(x, y, foodAmount) {
    this.x = x;
    this.y = y;
    this.foodAmount = foodAmount;
  }
  getState() {
    return {
      x: this.x,
      y: this.y,
      foodAmount: this.foodAmount,
    };
  }
  // Each time an ant finds this food source, it reduces the foodAmount
  takeFood() {
    if (this.foodAmount > 0) {
      this.foodAmount--;
      return true;
    } else {
      return false;
    }
  }
}

class Pheromone {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.strength = 30; // The strength of the pheromone decreases over time.
  }
}

class Ant {
  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.hasFood = false;
    this.pheromone = null;
    this.lifeSpan = Math.round(Math.random() * 100);

  }

  getState() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      hasFood: this.hasFood,
      color: this.hasFood ? "red" : "blue",
      pheromone: this.pheromone,
    };
  }

  move() {
    // Implement logic for movement here.
    this.x += Math.random() - 0.5;
    this.y += Math.random() - 0.5;
  }

  decrementLifeSpan() {
    this.lifeSpan = this.lifeSpan - 1
  }
  findFood(foodSources) {
    for (let foodSource of foodSources) {
      let dx = this.x - foodSource.x;
      let dy = this.y - foodSource.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= 1) {
        if (foodSource.takeFood()) {
          this.hasFood = true;
          this.pheromone = new Pheromone(this.x, this.y);
          return;
        }
      }
    }
  }

  moveToward(x, y) {
    // Normalize the direction vector (dx, dy) to a unit vector
    let dx = x - this.x;
    let dy = y - this.y;
    let length = Math.sqrt(dx * dx + dy * dy);
    dx /= length;
    dy /= length;

    // Let's say each ant moves 1 unit per step
    this.x += dx;
    this.y += dy;
  }

  bringFoodHome() {
    // If the ant is close enough to home, drop the food
    if (Math.abs(this.x) < 1 && Math.abs(this.y) < 1) {
      if (this.hasFood) {
        this.hasFood = false;
        return true;
      }
    } else {
      // Otherwise, move toward home
      this.moveToward(0, 0);
    }
    return false;
  }
}
const ULID = require("ulid")
class AntSimulator {
  constructor(numAnts, numFoodSources) {
    this.ants = [];
    this.foodSources = [];
    this.pheromones = [];
    this.gatheredFood = 0;

    for (let i = 0; i < numAnts; i++) {
      this.ants.push(new Ant(ULID.ulid(), 0, 0));
    }
    for (let i = 0; i < numFoodSources; i++) {
      // For simplicity, place food sources at random positions between -10 and 10.
      this.foodSources.push(
        new FoodSource(20 * Math.random() - 10, 20 * Math.random() - 10, 100)
      );
    }
  }

  getState() {
    const antStates = this.ants.map((ant) => ant.getState());
    const foodSourceStates = this.foodSources.map((foodSource) =>
      foodSource.getState()
    );

    const pheromoneStates = this.pheromones.map((pheromone) => ({
      x: pheromone.x,
      y: pheromone.y,
      strength: pheromone.strength,
    }));

    return {
      ants: antStates,
      foodSources: foodSourceStates,
      pheromones: pheromoneStates,
      gatheredFood: this.gatheredFood,
    };
  }

  log() {
    let antsWithFood = this.ants.filter((ant) => ant.hasFood).length;
    let totalFood = this.foodSources.reduce(
      (total, foodSource) => total + foodSource.foodAmount,
      0
    );

    console.log(`Step: ${this.stepCount}`);
    console.log(`Ants with food: ${antsWithFood}`);
    console.log(`Total food remaining: ${totalFood}`);
    // A simple visualization of the world as a 21x21 grid.
    // Each cell represents an area from -10 to 10 in x and y.
    // let world = Array(21)
    //   .fill()
    //   .map(() => Array(21).fill(" "));

    // // Mark food sources with 'F'
    // for (let foodSource of this.foodSources) {
    //   let x = Math.round(foodSource.x) + 10;
    //   let y = Math.round(foodSource.y) + 10;
    //   world[y][x] = "F";
    // }

    // // Mark ants with 'A'
    // for (let ant of this.ants) {
    //   let x = Math.round(ant.x) + 10;
    //   let y = Math.round(ant.y) + 10;
    //   if (0 <= x && x < 21 && 0 <= y && y < 21) {
    //     world[y][x] = "A";
    //   }
    // }

    // // Print the world
    // for (let row of world) {
    //   console.log(row.join(""));
    // }
  }

  step() {
    for (let ant of this.ants) {
      ant.move();
      if (!ant.hasFood) {
        ant.findFood(this.foodSources);
      } else {
        if (ant.bringFoodHome()) {
          this.gatheredFood++;

          if (this.gatheredFood > this.ants.length) {
            for (let i = 0; i < 10; i++) {
              this.ants.push(new Ant(ULID.ulid(), 0, 0));
            }
            this.foodSources.push(
              new FoodSource(2 * Math.random() - 10, 20 * Math.random() - 10, 100)
            );
          }
        }
      }
      ant.decrementLifeSpan();
      if (ant.lifeSpan <= 0) {
        this.ants = this.ants.filter(x=>x.id != ant.id)
      }
    }

    // Reduce the strength of all pheromones.
    // for (let ant of this.ants) {
    //   if (ant.pheromone) {
    //     ant.pheromone.strength--;
    //     if (ant.pheromone.strength <= 0) {
    //       ant.pheromone = null;
    //     }
    //   }
    // }

    for (let pheromone of this.pheromones) {
      pheromone.strength--;
      if (pheromone.strength <= 0) {
        const index = this.pheromones.indexOf(pheromone);
        if (index > -1) {
          this.pheromones.splice(index, 1);
        }
      }
    }
    // If an ant comes within a certain distance of a pheromone, move towards the pheromone.
    for (let ant of this.ants) {
      if (!ant.hasFood) {
        for (const otherAnt of this.ants) {
          if (otherAnt.pheromone) {
            let dx = ant.x - otherAnt.pheromone.x;
            let dy = ant.y - otherAnt.pheromone.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= 1) {
              ant.moveToward(otherAnt.pheromone.x, otherAnt.pheromone.y);
              break;
            }
          }
        }
      }
    }

    // If an ant drops a pheromone, add it to the list of pheromones.
    for (let ant of this.ants) {
      if (ant.pheromone && !this.pheromones.includes(ant.pheromone)) {
        this.pheromones.push(ant.pheromone);
      }
    }

    this.log();
  }

  run(steps) {
    for (let i = 0; i < steps; i++) {
      this.stepCount = i + 1;
      this.step();
    }
  }
}

///////
const WebSocket = require("ws");
let wss = new WebSocket.Server({ port: 8080 });
wss.on("connection", (ws) => {
  let simulator = new AntSimulator(10, 10);
  setInterval(() => {
    simulator.step();
    ws.send(JSON.stringify(simulator.getState()));
  }, 500);
});

