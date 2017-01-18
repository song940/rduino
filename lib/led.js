
/*
 * Main LED constructor
 * Process options
 * Tell the board to set it up
 */
function LED (board, pin) {
  this.board = board;
  this.pin   = pin || 13;
  this.board.pinMode(this.pin, 0x02);
}
/*
 * Turn the LED on
 */
LED.prototype.on = function () {
  this.board.digitalWrite(this.pin, 0xff);
}

/* 
 * Turn the LED off
 */
LED.prototype.off = function () {
  this.board.digitalWrite(this.pin, 0x00);
}

LED.prototype.brightLevel = function(val) {
  this.board.analogWrite(this.pin, this.bright = val);
}

LED.prototype.fade = function(interval) {
	to = (interval||5000)/(255*2);
	var self = this;
	setInterval(function() {
		if(!self.board.serial) return; //Interval too fast for debug messages on ^c
		if(self.bright==0) direction = 1;
		if(self.bright==255) direction = -1;
		self.brightLevel(self.bright+direction);
	},to);
}

/*
 * Start a bariable blinking pattern
 */
LED.prototype.blink = function (interval) {
  interval = interval || 1000;
  var self = this;
  var status = 0;
  setInterval(function(){
    if(status) {
      self.off();
    } else {
      self.on();
    }
    status = !status;
  }, interval);
  return this;
}

module.exports = LED;
