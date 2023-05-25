"use strict";
const socket = new WebSocket("ws://localhost:8080");
let mainDiv = document.querySelector('.main');
let width = mainDiv.offsetWidth;
let scaleX = d3.scaleLinear().domain([-10, 10]).range([0, width]);
let scaleY = d3.scaleLinear().domain([-10, 10]).range([0, width]);
let svg = d3.select("svg");
let simId = "";
const foodValue = document.getElementById('gathered-food');
// An object to hold paths for each ant
let antPaths = {};
socket.onmessage = function (event) {
    // Parse the incoming message to get the state of the simulation.
    const body = JSON.parse(event.data);
    const { id, state } = body;
    console.log('id', id);
    simId = id;
    const { pheromones, foodSources, ants } = state;
    // Update the ants.
    const antSelection = svg.selectAll(".ant").data(ants, (d) => d.id);
    antSelection
        .join((enter) => enter.append("circle").attr("class", "ant"), (update) => update, (exit) => {
        exit.each((d) => delete antPaths[d.id]); // Remove path when ant is removed
        exit.remove();
    })
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
        }
        else {
            let currentPath = antPaths[ant.id].attr("d");
            antPaths[ant.id].attr("d", currentPath + ` L${scaleX(ant.x)} ${scaleY(ant.y)}`);
        }
    });
    // Update the food sources.
    const foodSelection = svg
        .selectAll(".food")
        .data(foodSources, (d) => `${d.x}-${d.y}`);
    foodSelection
        .join((enter) => enter.append("circle").attr("class", "food"), (update) => update, (exit) => exit.remove())
        .attr("cx", (d) => scaleX(d.x))
        .attr("cy", (d) => scaleY(d.y))
        .attr("r", (d) => Math.sqrt(d.foodAmount) * 2) // Size depends on the food amount.
        .attr("fill", "green");
    // Update the pheromones.
    const pheromoneSelection = svg
        .selectAll(".pheromone")
        .data(pheromones, (d) => `${d.x}-${d.y}`);
    pheromoneSelection
        .join((enter) => enter.append("circle").attr("class", "pheromone"), (update) => update, (exit) => exit.remove())
        .attr("cx", (d) => scaleX(d.x))
        .attr("cy", (d) => scaleY(d.y))
        .raise()
        .attr("r", (d) => d.strength / 5) // Size depends on the pheromone's strength.
        .attr("fill", "purple");
    // Display gathered food.
    // let foodCounter: any = d3.select("#food-counter");
    // if (foodCounter.empty()) {
    //   foodCounter = svg
    //     .append("text")
    //     .attr("id", "food-counter")
    //     .attr("x", 40)
    //     .attr("y", 200)
    //     .attr("font-size", "20px")
    //     .attr("fill", "black");
    // }
    // foodCounter.text(`Gathered food: ${state.gatheredFood}`);
    foodValue.value = state.gatheredFood;
    const antPathSelection = svg.selectAll(".ant-path").data(ants, (d) => d.id);
    // Helper function to generate path data from ant positions
    function generatePathData(ant) {
        if (!ant.path) {
            ant.path = `M${scaleX(ant.x)} ${scaleY(ant.y)}`;
        }
        else {
            ant.path += `L${scaleX(ant.x)} ${scaleY(ant.y)}`;
        }
        return ant.path;
    }
    antPathSelection
        .join((enter) => enter.append("path").attr("class", "ant-path"), (update) => update, (exit) => exit.remove())
        .attr("d", generatePathData)
        .attr("fill", "none")
        .attr("stroke", (d) => `rgba(255, 255, 255, ${d.alpha})`)
        .attr("stroke-width", 2);
};
const pheromoneStrengthSlider = document.getElementById('pheromone-strength');
const lifespanSlider = document.getElementById('lifespan');
const pheromoneStrengthValue = document.getElementById('pheromone-value');
const lifespanValue = document.getElementById('lifespan-value');
pheromoneStrengthSlider.addEventListener('input', (e) => {
    const target = e.target;
    const newValue = target.value;
    pheromoneStrengthValue.textContent = newValue;
    // Now send the new value to the server
    sendValueToServer('pheromone-strength', newValue);
});
lifespanSlider.addEventListener('input', (e) => {
    const target = e.target;
    const newValue = target.value;
    lifespanValue.textContent = newValue;
    // Now send the new value to the server
    sendValueToServer('lifespan', newValue);
});
function sendValueToServer(parameter, value) {
    console.log("parameter", parameter);
    const message = {
        simId,
        parameter: parameter,
        value: value
    };
    socket.send(JSON.stringify(message));
}
