export class Pheromone {
  x = 0;
  y = 0;
  strength = 0;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.strength = 20; // The strength of the pheromone decreases over time.
  }
}
