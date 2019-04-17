let data_base;
let data_lenght;
let current_non_letter = 0;
let num_non_letters;
let total_letters_saved = 0;
let current_path = 0;
let current_char = 0;
let save = true;
let run = true;
let total_letters;
let random_padding;
const int_to_char = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                     'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
                     'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
                     'à', 'â', 'ç', 'é', 'è', 'ê', 'ë', 'î', 'ï', 'ô', 'ù', 'û', 'ü',
                     'À', 'Â', 'Ç', 'É', 'È', 'Ê', 'Ë', 'Î', 'Ï', 'Ô', 'Ù', 'Û', 'Ü',
                     '.', '?', '!', ',', ';', ':', '/', '\\', '«', '<','(', '[', '{', '»','>', ')',  ']', '}', '"', "'", '-', '_', '&', '#', '@', '$', '+', '=', '%', '*', '#', '§', '°'];
function preload(){
  loadJSON('../assets/json/data.json', data => {
    data_base = data['fonts'];
    data_lenght = data['fonts'].length;
    num_non_letters = data_lenght * 40;
    total_letters = num_non_letters + data_lenght * int_to_char.length;
  });
}
function setup(){
  socket = io.connect('http://localhost:3000');
  createCanvas(64, 64);
  background(0);
  pixelDensity(1);
  smooth();
  textAlign(CENTER);
  p_percentage = createP();
  socket.on('random_padding', data => random_padding = data.random_padding);
}
function draw(){
  socket.on('run', () => run = true);
  if(run && random_padding !== 'undefined'){
    let total_percentage = 100 * ( total_letters_saved/total_letters);
    total_percentage = total_percentage.toFixed(2);
    p_percentage.html('Percentage: ' + total_percentage + '%.');
    let hs = document.getElementsByTagName('style');
    while(hs.length > 1){
      hs[0].parentNode.removeChild(hs[0]);
    }
    if(current_non_letter < num_non_letters){
      background(255);
      fill(0);
      noStroke();
      beginShape();
      for(let i = 0; i < int(random(3, 10)); i++){
        vertex(random(0, width), random(0, height));
      }
      endShape(CLOSE);
      var image = canvas.toDataURL('image/png');
      socket.emit('image', {
        image: image.toString('base64'),
        num_letter: total_letters_saved,
        letter: 0,
        train_or_test: random(0, 1)
      });
      current_non_letter++;
      total_letters_saved++;
    } else{
      drawing = loadFont(data_base[current_path].path, font => {
        wait_for_drawing = false;
        background(255);
        textFont(font, random(width/2 - random_padding , width/2 + random_padding));
        let current_letter = int_to_char[current_char];
        text(current_letter, random(width/2 - random_padding, width/2 + random_padding), random(height * 3/4 - random_padding, height * 3/4 + random_padding));
        let image = canvas.toDataURL('image/png');
        run = false;
        if(save){
          socket.emit('image', {
            image: image.toString('base64'),
            num_letter: total_letters_saved,
            letter: current_char + 1,
            font: current_path,
            train_or_test: random(0, 1)
          });
        }
        total_letters_saved++;
        current_char++;
        if(current_char == int_to_char.length){
          current_char = 0;
          current_path++;
          if(current_path == data_lenght){
            socket.emit('close', {
              close: true
            });
            current_path = 0;
            save = false;
            window.close();
          }
        }
      });
    }
  }
}
