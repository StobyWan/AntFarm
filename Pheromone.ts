export class Pheromone {
  x = 0;
  y = 0;
  strength = 0;
  constructor(x: number, y: number, strength = 20) {
    this.x = x;
    this.y = y;
    this.strength = strength; // The strength of the pheromone decreases over time.
  }
}
