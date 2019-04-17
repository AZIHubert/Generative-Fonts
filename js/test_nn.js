const fs = require('fs');
const express = require('express');
const path = require('path');
const opn = require('opn');
const socket = require('socket.io');

module.exports = {
  test_letter_recognition: test_letter_recognition
}

function test_letter_recognition(){
  const app = express();
  const server = app.listen(3000);
  const public = path.join(__dirname, '../public');
  app.get('/', function(req, res) {
    res.sendFile(path.join(public, 'test_nn.html'));
  });
  app.use("/", express.static('public'));
  opn('http://localhost:3000');
}
