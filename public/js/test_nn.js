let can_test = false;
let can_draw = false;
let myFont;
let model;
let p_prediction;
let p_test;
let shapes = [];
let shape = [];
let reset_button;
const int_to_char = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                     'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
                     'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
                     'à', 'â', 'ç', 'é', 'è', 'ê', 'ë', 'î', 'ï', 'ô', 'ù', 'û', 'ü',
                     'À', 'Â', 'Ç', 'É', 'È', 'Ê', 'Ë', 'Î', 'Ï', 'Ô', 'Ù', 'Û', 'Ü',
                     '.', '?', '!', ',', ';', ':', '/', '\\', '«', '<','(', '[', '{', '»','>', ')',  ']', '}', '"', "'", '-', '_', '&', '#', '@', '$', '+', '=', '%', '*', '#', '°', '§'];
function setup(){
  createCanvas(64, 64);
  background(255);
  pixelDensity(1);
  load_model().then(model_ => {
    model = model_;
    can_test = true;
    p_prediction = createP();
    p_test = createP();
    reset_button = createButton('Reset canvas');
    reset_button.mousePressed(() => {
      shapes = [];
      background(255);
    });
  });
}

function draw(){
  background(255);
  if(can_test){
    for(shape of shapes){
      noFill();
      strokeWeight(2);
      stroke(0);
      beginShape();
      for(point of shape){
        vertex(point.x, point.y);
      }
      endShape();
    }
    p_prediction.html();
  }
  if(can_draw){
    shape.push({x: mouseX, y: mouseY});
  }
}

async function load_model(){
  const model = await tf.loadLayersModel('http://localhost:3000/assets/models/letter_recognition/model.json');
  model.summary();
  return model;
}

function mousePressed(){
  can_draw = true;
}
function mouseReleased(){
  can_draw = false;
  shape = [];
  shapes.push(shape);
  tf.tidy(() => {
    let pix = [];
    loadPixels();
      for(let j = 0; j<width*height*4; j+=4){
        let p = ((pixels[j] + pixels[j+1] + pixels[j+2]) / 3)/255;
        pix.push(p);
      }
    updatePixels();
    model.predict(tf.tensor4d(pix, [1, sqrt(pix.length), sqrt(pix.length), 1])).argMax([-1]).data().then(data_argMax => {
      if(data_argMax[0] == 0){
        model.predict(tf.tensor4d(pix, [1, sqrt(pix.length), sqrt(pix.length), 1])).data().then(data => {
          data = Array.from(data);
          data.shift();
          p_prediction.html('This shape is not a letter but it seems to be a ' + int_to_char[tf.tensor1d(data).argMax([-1]).dataSync()] + ' with: ' + tf.tensor1d(data).max().dataSync() + " probability.").style('color', 'white');
        });
      } else{
        model.predict(tf.tensor4d(pix, [1, sqrt(pix.length), sqrt(pix.length), 1])).max().data().then(data_max => {
          p_prediction.html('This shape is a \"' + int_to_char[data_argMax[0]] + "\" with:" + data_max[0].toFixed(2) + " probability.").style('color', 'white');
        });
      }
    });
  });
}
