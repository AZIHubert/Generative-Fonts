const opn = require('opn');
const socket = require('socket.io');
const path = require('path');
const express = require('express');

module.exports = {
  run: run
}

function run(){
  const app = express();
  const server = app.listen(3000);
  const public = path.join(__dirname, '../public');
  app.get('/', function(req, res) {
    res.sendFile(path.join(public, 'genetic_font.html'));
  });
  app.use("/", express.static('public'));
  opn('http://localhost:3000');
}
