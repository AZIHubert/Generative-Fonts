let loader_p;
let go;
let database;
let current_font_number = 0;
let current_font;
function setup(){
  loader_p = createP('Loading data...');
  createCanvas(50, 50);
  background(0);
  pixelDensity(1);
  socket = io.connect('http://localhost:3000');
  socket.on('path', data => {
    path = data;
    database = loadJSON(path, data => {
      loader_p.html('');
      go = true;
      current_font = data.fonts[current_font_number].path;
    });
  });
}
function draw(){
  if(go){
    let hs = document.getElementsByTagName('style');
    while(hs.length > 1){
      hs[hs.length-1].parentNode.removeChild(hs[hs.length-1]);
    }
    console.log(current_font);
    loadFont(current_font, () => {
        current_font_number++;
        console.log(current_font_number);
        current_font = database.fonts[current_font_number].path;
    })
  }
}
