let population;
let i = 0;
function setup(){
  createCanvas(128, 128);
  pixelDensity(1);
  population = new Population();
  population.create_first_generation();
}
function draw(){
  population.create_next_generation();
}
