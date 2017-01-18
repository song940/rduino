
var arduino = require('..');

var board = new arduino.Board();

board.on('ready', function(){
  board.write('!123456789.');
});