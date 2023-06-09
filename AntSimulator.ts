import { Ant } from './Ant';
import { FoodSource } from './FoodSource';
import { Pheromone } from './Pheromone';
import * as ULID from "ulid";

export class AntSimulator {

    ants: Ant[] = []
    foodSources: FoodSource[] = []
    pheromones: Pheromone[] = []
    gatheredFood = 0
    stepCount = 0
    constructor(numAnts: number, numFoodSources: number) {
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
  
    run(steps: any[]) {
      for (let i = 0; i < steps.length; i++) {
        this.stepCount = i + 1;
        this.step();
      }
    }
  }