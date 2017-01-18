const util         = require('util');
const EventEmitter = require('events');
/*
 * Main Button constructor
 * Process options
 * Tell the board to set it up
 */
function Button(board, pin) {
  var self = this;
  this.board = board;
  this.pin   = pin || 13;
  this.board.pinMode(this.pin, 0x01);
  setInterval(function () {
    self.board.digitalRead(self.pin, function(val){
      console.log(val);
    });
  }, 50);
}

util.inherits(Button, EventEmitter);

module.exports = Button;
