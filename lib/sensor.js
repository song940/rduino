var events = require('events'),
    util = require('util');

/*
 * Main Sensor constructor
 * Process options
 * Tell the board to set it up
 */
function Sensor(options) {
  this.board = board;
  this.pin = options.pin || 'A0';
  this.board.pinMode(this.pin, 0x01);
  // Poll for sensor readings
  setInterval(function () {
    this.board.analogRead(this.pin);
  }.bind(this), options.throttle || 50);
  // When data is received, parse inbound message
  // match pin to instance pin value
  this.board.on('data', function (message) {
    var m = message.slice(0, -1).split('::'),
        err = null,
        pin, data;

    if (!m.length) {
      return;
    }

    pin = m[0]
    data = m.length === 2 ? m[1] : null;

    if (pin === this.pin) {
      this.emit('read', err, data);
    }
  }.bind(this));
};

/*
 * EventEmitter, I choose you!
 */
util.inherits(Sensor, events.EventEmitter);

module.exports = Sensor;
