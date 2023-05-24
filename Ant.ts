import { Pheromone } from './Pheromone';
export class Ant {
    id = ""
    x = 0
    y = 0
    hasFood = false
    pheromone?: Pheromone
    lifeSpan = 0
    constructor(id: string, x: number, y: number) {
      this.id = id;
      this.x = x;
      this.y = y;
      this.hasFood = false;
      this.lifeSpan = Math.round(Math.random() * 1000);
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
  
    findFood(foodSources: any) {
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
  
    moveToward(x: number, y: number) {
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