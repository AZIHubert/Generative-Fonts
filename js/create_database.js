const fs = require('fs');
const express = require('express');
const opn = require('opn');
const path = require('path');
const socket = require('socket.io');
const ba64 = require("ba64");

module.exports = {
  run: run,
}
function create_json(){
  let array_fonts_dir = [];
  let json_fonts_dir = {};
  const main_dir_check = 'public/assets/fonts';
  const main_dir_save = 'assets/fonts';
  const fonts_folder = fs.readdirSync(main_dir_check);
  for(ff of fonts_folder){
    const weights_font = fs.readdirSync(main_dir_check + '/' + ff + '/web fonts');
    for(wf of weights_font){
      const font = fs.readdirSync(main_dir_check + '/' + ff + '/web fonts/' + wf);
      for(f of font){
        if(extension(f))
          array_fonts_dir.push({'name' : wf, 'path' : main_dir_save + '/' + ff + '/web fonts/' + wf + '/' + f});
      }
    }
  }
  json_fonts_dir['fonts'] = array_fonts_dir;
  const content = JSON.stringify(json_fonts_dir);
  fs.writeFileSync('public/assets/json/data.json', content, 'utf8', function (err) {
    if (err) {
        return console.log(err);
    }
  });
  console.log("All directories saved in 'public/assets/json/data.json'");
  console.log('\n');
}

function extension(element) {
  const extName = path.extname(element);
  return extName === '.ttf'
};
async function run(random_padding){
  console.log('--------------------------');
  console.log('--------------------------');
  console.log('--- Create Data for IA ---');
  console.log('--------------------------');
  console.log('--------------------------');
  console.log('\n');
  console.log('>>>>>>>>>>>>><<<<<<<<<<<<<');
  console.log('   >>>>>>>>>><<<<<<<<<<');
  console.log('      >>>>>>><<<<<<<');
  console.log('         >>>><<<<');
  console.log('            ><');
  console.log('\n\n');
  const json_folder_directory = 'public/assets/';
  if (!fs.existsSync(json_folder_directory + 'json/data.json')) {
    await create_data_path();
  }
  if (!fs.existsSync(json_folder_directory + "images")) {
    fs.mkdirSync(json_folder_directory + "images");
  }
  const fonts_folder = fs.readdirSync(json_folder_directory + "images");
  num_data = fonts_folder.length;
  fs.mkdirSync(json_folder_directory + "images/data_" + num_data);
  fs.mkdirSync(json_folder_directory + "images/data_" + num_data + "/data_for_letter_recognition");
  fs.mkdirSync(json_folder_directory + "images/data_" + num_data + "/data_for_letter_recognition/train");
  fs.mkdirSync(json_folder_directory + "images/data_" + num_data + "/data_for_letter_recognition/test");
  fs.mkdirSync(json_folder_directory + "images/data_" + num_data + "/data_for_letter_similarity");
  fs.mkdirSync(json_folder_directory + "images/data_" + num_data + "/data_for_letter_similarity/train");
  fs.mkdirSync(json_folder_directory + "images/data_" + num_data + "/data_for_letter_similarity/test");
  create_sub_folder_data_jpg(num_data);
  run_p5_for_create_data(num_data, random_padding);
}
function run_p5_for_create_data(num_data, random_padding){
  const app = express();
  const public = path.join(__dirname, '../public');
  app.get("/", (req, res) => res.sendFile(path.join(public, 'create_data_jpg.html')));
  app.use("/", express.static('public'));
  const server = app.listen(3000);
  const io = socket(server);
  opn('http://localhost:3000');
  io.on('connection', socket => {
    socket.emit('random_padding', {random_padding: random_padding});
    socket.on("image", image => {
      data_url = image.image;
      let train_or_test;
      if(image.train_or_test > 0.1){
        train_or_test = 'train';
      } else {
        train_or_test = 'test';
      }
      if(image.letter == 0){
        ba64.writeImageSync('public/assets/images/data_' + num_data + '/data_for_letter_recognition/' + train_or_test + '/' + image.letter + '/' + image.num_letter, data_url);
      } else{
        ba64.writeImageSync('public/assets/images/data_' + num_data + '/data_for_letter_recognition/' + train_or_test + '/' + image.letter + '/' + image.num_letter, data_url);
        if(random_padding == 0){
          ba64.writeImageSync('public/assets/images/data_' + num_data + '/data_for_letter_similarity/' + train_or_test + '/' + image.font + '/' + image.num_letter, data_url);
        }
      }
      socket.emit('run', {run: true});
    });
    socket.on('close', () => process.exit(0))
  });
}

function create_sub_folder_data_jpg(num_data){
  const json_folder_directory = 'public/assets/';
  const train_test = ['train', 'test'];
  const int_to_char = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                       'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
                       'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
                       'à', 'â', 'ç', 'é', 'è', 'ê', 'ë', 'î', 'ï', 'ô', 'ù', 'û', 'ü',
                       'À', 'Â', 'Ç', 'É', 'È', 'Ê', 'Ë', 'Î', 'Ï', 'Ô', 'Ù', 'Û', 'Ü',
                       '.', '?', '!', ',', ';', ':', '/', '\\', '«', '<','(', '[', '{', '»','>', ')',  ']', '}', '"', "'", '-', '_', '&', '#', '@', '$', '+', '=', '%', '*', '#', '§', '°'];
  console.log("Total letter saved : " + int_to_char.length);
  const file = fs.readFileSync('public/assets/json/data.json');
  const  obj = JSON.parse(file);
  const fonts = obj.fonts;
  for(t of train_test){
    for(let i = 0; i < int_to_char.length + 1; i++){
      fs.mkdirSync(json_folder_directory + "images/data_" + num_data + "/data_for_letter_recognition/" + t + '/'+ i);
    }
    for(let i = 0; i < fonts.length; i++){
      fs.mkdirSync(json_folder_directory + "images/data_" + num_data + "/data_for_letter_similarity/" + t + '/'+ i);
    }
  }
}

function test_path(){
  create_data_path();
  const app = express();
  const server = app.listen(3000);
  const public = path.join(__dirname, '../public');
  const io = socket(server);
  const path_for_p5 = "assets/json/data.json";
  io.on('connection', socket => {
    socket.emit('path', path_for_p5);
  });
  app.get('/', function(req, res) {
    res.sendFile(path.join(public, 'test_path.html'));
  });
  app.use("/", express.static('public'));
  opn('http://localhost:3000');
}
