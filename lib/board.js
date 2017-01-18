const fs           = require('fs');
const util         = require('util');
const colors       = require('colors');
const child        = require('child_process');
const SerialPort   = require('serialport');
const EventEmitter = require('events');
/*
 * The main Arduino constructor
 * Connect to the serial port and bind
 */
function Board(path, options) {
  var self = this;
  options = options || {};
  if(typeof path === 'string'){
    options.path = path;
  }else{
    options = path || {};
  }
  var defaults = {
    path    : '',
    debug   : !false,
    baudrate: 9600
  };
  for(var k in options){
    defaults[ k ] = options[ k ];
  }
  this.buffer = [];
  this.options = defaults;
  this.options.path = '/dev/cu.usbserial-A9E1DR7R';
  var port = new SerialPort(this.options.path, {
    baudrate: this.options.baudrate,
    parser: SerialPort.parsers.readline('\n')
  }).on('open', function(){
    self.serial = port;
    self.emit('connected');
    self.emit('ready');
  }).on('data', function(data){
    self.log('receive', data.toString().red);
    self.emit('data', data);
  });
};

/*
 * EventEmitter, I choose you!
 */
util.inherits(Board, EventEmitter);

Board._ = {
  PIN_MODE     : 0x01,
  DIGITAL_READ : 0x02,
  DIGITAL_WRITE: 0x03,
  ANALOG_READ  : 0x04,
  ANALOG_WRITE : 0x05
};

/*
 * Low-level serial write
 */
Board.prototype.write = function (data) {
  if (this.serial) {
    this.log('write', data);
    this.serial.write(data);
  } else {
    this.log('info', 'serial not ready, buffering message: ' + data.red);
    this.buffer.push(data);
  }
  return this;
}

/*
 * Process the buffer (messages attempted before serial was ready)
 */
Board.prototype.flush = function () {
  this.log('info', 'processing buffered messages');
  while (this.buffer.length > 0) {
    this.log('info', 'writing buffered message');
    this.write(this.buffer.shift());
  }
  return this;
}

function leftpad(str, len, b){
  str = str.toString();
  len = len - str.length;
  while(len--) str = (b || ' ') + str;
  return str;
};

Board.prototype.send = function(cmd, pin, val){
  cmd = leftpad(cmd, 3, '0');
  pin = leftpad(pin, 3, '0');
  val = leftpad(val, 3, '0');
  return this.write([ '!', cmd, pin, val, '.' ].join(''));
};

Board.IN  = 0x01;
Board.OUT = 0x02;
Board.prototype.pinMode = function (pin, val) {
  return this.send(Board._.PIN_MODE, pin, val);
}

/*
 * Tell the board to extract data from a pin
 */
Board.prototype.digitalRead = function (pin) {
  return this.send(Board._.DIGITAL_READ, pin);
}
/*
 * Tell the board to write to a digital pin
 */
Board.LOW  = 0x00;
Board.HIGH = 0xff;
Board.prototype.digitalWrite = function (pin, val) {
  return this.send(Board._.DIGITAL_WRITE, pin, val);
}

Board.prototype.analogWrite = function (pin, val) {
  this.send(Board._.ANALOG_WRITE, pin, val);
}

Board.prototype.analogRead = function (pin) {
  return this.send(Board._.ANALOG_READ, pin);
}

/*
 * Utility function to pause for a given time
 */
Board.prototype.delay = function (ms) {
  ms += +new Date();
  while (+new Date() < ms) { }
  return this;
}

Board.prototype.log = function () {
  var args = [].slice.call(arguments);
  if (this.options.debug) {
    console.log(String(+new Date()).grey + ' duino '.blue + args.shift().magenta + ' ' + args.join(', '));
  }
  return this;
}

module.exports = Board;
