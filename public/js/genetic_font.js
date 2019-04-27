let population;
let i = 0;
function setup(){
  createCanvas(128, 128);
  noLoop();
  pixelDensity(1);
  population = new Population();
  population.create_first_generation();
}
function draw(){
  population.create_next_generation();
}

function mouseClicked() {
  loop();
  noLoop();
}
