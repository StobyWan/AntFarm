export class FoodSource {
    foodAmount = 0
    y = 0
    x = 0
    constructor(x: number, y: number, foodAmount: number) {
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
  