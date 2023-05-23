// // Connect to the Node.js server with WebSocket.
// // Replace 'ws://localhost:8080' with the address of your server.
// let socket = new WebSocket('ws://localhost:8080');
// let canvas = document.getElementById('canvas');
// let ctx = canvas.getContext('2d');
// let antPaths = [];
// let scaleX = d3.scaleLinear().domain([-10, 10]).range([0, 800]);
// let scaleY = d3.scaleLinear().domain([-10, 10]).range([0, 800]);

// function drawAntPaths(ants) {
//   ants.forEach(ant => {
//     let existingPath = antPaths.find(path => path.id === ant.id);
//     if (existingPath) {
//       existingPath.x = scaleX(ant.x);
//       existingPath.y = scaleY(ant.y);
//     } else {
//       antPaths.push({
//         id: ant.id,
//         x: scaleX(ant.x),
//         y: scaleY(ant.y),
//         alpha: 1.0 // Start with full opacity
//       });
//     }
//   });

//   // Draw ant paths and fade them over time
//   antPaths.forEach(path => {
//     ctx.fillStyle = `rgba(255, 255, 255, ${path.alpha})`; // Using RGBA color
//     ctx.fillRect(path.x, path.y, 2, 2);
//     path.alpha -= 0.01;
//     if (path.alpha < 0) path.alpha = 0; // Ensure it doesn't go below 0
//   });

//   // Remove paths that have fully faded
//   antPaths = antPaths.filter(path => path.alpha > 0);
// }

// socket.onmessage = function(event) {
//   // Parse the incoming message to get the state of the simulation.
//   const state = JSON.parse(event.data);
//   const { pheromones, foodSources, ants } = state
//   console.log('state', state)
//   drawBackground();
//   // drawFoodSources(foodSources);
//   drawAntPaths(ants);
//   // Scale the positions to fit within the SVG.
//   // Select the SVG element.
//   let svg = d3.select('svg');

//   const antSelection = svg.selectAll('.ant').data(ants, d => d.id);

//   antSelection.join(
//     enter => enter.append('circle').attr('class', 'ant'),
//     update => update,
//     exit => exit.remove()
//   )
//     .attr('cx', d => scaleX(d.x))
//     .attr('cy', d => scaleY(d.y))
//     .attr('r', 5)
//     .attr('fill', d => d.color);

//   // Update the food sources.
//   const foodSelection = svg.selectAll('.food').data(foodSources, d => `${d.x}-${d.y}`);

//   foodSelection.join(
//     enter => enter.append('circle').attr('class', 'food'),
//     update => update,
//     exit => exit.remove()
//   )
//     .attr('cx', d => scaleX(d.x))
//     .attr('cy', d => scaleY(d.y))
//     .attr('r', d => Math.sqrt(d.foodAmount) * 2)  // Size depends on the food amount.
//     .attr('fill', 'green');

//   // Update the pheromones.
//   const pheromoneSelection = svg.selectAll('.pheromone').data(pheromones, d => `${d.x}-${d.y}`);

//   pheromoneSelection.join(
//     enter => enter.append('circle').attr('class', 'pheromone'),
//     update => update,
//     exit => exit.remove()
//   )
//     .attr('cx', d => scaleX(d.x))
//     .attr('cy', d => scaleY(d.y))
//     .attr('r', d => d.strength / 20)  // Size depends on the pheromone's strength.
//     .attr('fill', 'purple');

//    // Display gathered food.
//    const foodCounter = d3.select('#food-counter');
//    if (foodCounter.empty()) {
//      foodCounter = svg.append('text')
//        .attr('id', 'food-counter')
//        .attr('x', 40)
//        .attr('y', 200)
//        .attr('font-size', '20px')
//        .attr('fill', 'black');
//    }
//    foodCounter.text(`Gathered food: ${state.gatheredFood}`);
// };
let socket = new WebSocket("ws://localhost:8080");
let scaleX = d3.scaleLinear().domain([-10, 10]).range([0, 800]);
let scaleY = d3.scaleLinear().domain([-10, 10]).range([0, 800]);
let svg = d3.select("svg");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
// An object to hold paths for each ant
let antPaths = {};
function drawBackground() {
  ctx.fillStyle = "brown";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
socket.onmessage = function (event) {
  // Parse the incoming message to get the state of the simulation.
  const state = JSON.parse(event.data);
  const { pheromones, foodSources, ants } = state;
  drawBackground();
  // Update the ants.
  const antSelection = svg.selectAll(".ant").data(ants, (d) => d.id);

  antSelection
    .join(
      (enter) => enter.append("circle").attr("class", "ant"),
      (update) => update,
      (exit) => {
        exit.each((d) => delete antPaths[d.id]); // Remove path when ant is removed
        exit.remove();
      }
    )
    .attr("cx", (d) => scaleX(d.x))
    .attr("cy", (d) => scaleY(d.y))
    .attr("r", 5)
    .raise()
    .attr("fill", (d) => d.color);

  // Update the paths.
  ants.forEach((ant) => {
    if (!antPaths[ant.id]) {
      antPaths[ant.id] = svg
        .append("path")
        .attr("class", "ant-path")
        .attr("stroke", `rgba(255, 255, 255, 1)`)
        .lower()
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("d", `M${scaleX(ant.x)} ${scaleY(ant.y)}`);
    } else {
      let currentPath = antPaths[ant.id].attr("d");
      antPaths[ant.id].attr(
        "d",
        currentPath + ` L${scaleX(ant.x)} ${scaleY(ant.y)}`
      );
    }
  });

  // Fade all paths over time
  // svg.selectAll('.ant-path')
  //   .attr('stroke', (d, i, nodes) => {
  //     let currentColor = d3.color(d3.select(nodes[i]).attr('stroke'));

  //     if (currentColor.opacity <= 0) {
  //       currentColor.opacity = 1.0
  //     } else {
  //       currentColor.opacity -= 0.01;
  //     }

  //     return currentColor;
  //   });

  // Update the food sources.
  const foodSelection = svg
    .selectAll(".food")
    .data(foodSources, (d) => `${d.x}-${d.y}`);

  foodSelection
    .join(
      (enter) => enter.append("circle").attr("class", "food"),
      (update) => update,
      (exit) => exit.remove()
    )
    .attr("cx", (d) => scaleX(d.x))
    .attr("cy", (d) => scaleY(d.y))
    .attr("r", (d) => Math.sqrt(d.foodAmount) * 2) // Size depends on the food amount.
    .attr("fill", "green");

  // Update the pheromones.
  const pheromoneSelection = svg
    .selectAll(".pheromone")
    .data(pheromones, (d) => `${d.x}-${d.y}`);

  pheromoneSelection
    .join(
      (enter) => enter.append("circle").attr("class", "pheromone"),
      (update) => update,
      (exit) => exit.remove()
    )
    .attr("cx", (d) => scaleX(d.x))
    .attr("cy", (d) => scaleY(d.y))
    .raise()
    .attr("r", (d) => d.strength / 5) // Size depends on the pheromone's strength.
    .attr("fill", "purple");

  // Display gathered food.
  const foodCounter = d3.select("#food-counter");
  if (foodCounter.empty()) {
    foodCounter = svg
      .append("text")
      .attr("id", "food-counter")
      .attr("x", 40)
      .attr("y", 200)
      .attr("font-size", "20px")
      .attr("fill", "black");
  }
  foodCounter.text(`Gathered food: ${state.gatheredFood}`);

  const antPathSelection = svg.selectAll(".ant-path").data(ants, (d) => d.id);

  // Helper function to generate path data from ant positions
  function generatePathData(ant) {
    if (!ant.path) {
      ant.path = `M${scaleX(ant.x)} ${scaleY(ant.y)}`;
    } else {
      ant.path += `L${scaleX(ant.x)} ${scaleY(ant.y)}`;
    }
    return ant.path;
  }

  antPathSelection
    .join(
      (enter) => enter.append("path").attr("class", "ant-path"),
      (update) => update,
      (exit) => exit.remove()
    )
    .attr("d", generatePathData)
    .attr("fill", "none")
    .attr("stroke", (d) => `rgba(255, 255, 255, ${d.alpha})`)
    .attr("stroke-width", 2);
};
