let population;
let i = 0;
function setup(){
  createCanvas(64, 64);
  pixelDensity(1);
  //frameRate(3);
  population = new Population();
  population.create_first_generation();
}
function draw(){
  population.create_next_generation();
}
