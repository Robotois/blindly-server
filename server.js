var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var port = process.env.PORT || 3000;
var Sensors = require('./Sensors');

server.listen(port, function (err) {
  if(err) {
    return console.error(err);
  }
  return console.info(`Server running on http://localhost:${port}`);
});

const sensors = new Sensors();
sensors.listenTo(io.of('/sensors'));
