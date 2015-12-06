

// Externals
var SerialPort = require('serialport').SerialPort,
	EventEmitter = require('events').EventEmitter,
	util = require('util');



// Public
function SerialComms (port) {
	this._echoBuffer = '';
	this._responseBuffer = '';
	this._port = new SerialPort(port, {
		baudrate: 9600,
		disconnectedCallback: process.exit
	}, false);

	this._initPort();
}
util.inherits(SerialComms, EventEmitter);


SerialComms.prototype._initPort = function () {
	var _this = this;

	this._port.on('data', function (data) {
		data = '' + data;
		var len = data.length,
			response;

		if (data == _this._echoBuffer.substr(0, len)) {
			_this._echoBuffer = _this._echoBuffer.substr(len);
		} else {
			_this._responseBuffer += data;

			if (_this._responseBuffer.substr(-2) == '> ') {
				response = _this._responseBuffer.substr(0, _this._responseBuffer.length - 4);
				_this._responseBuffer = '';
				_this.emit('response', response);
			}
		}
	});

	this._port.open(this._handlePortOpen.bind(this));
};

SerialComms.prototype._handlePortOpen = function (err) {
	if (err) return this.emit('error', new Error('Failed to open port: ' + err));
	this.emit('ready', this);
};


SerialComms.prototype.send = function (data) {
	if (!this._port) return this.emit('error', new Error('Port not open'));

	data = '' + data;
	this._echoBuffer += data;

	this._port.write(data, function(err) {
		if (err) this.emit('error', err);
	}.bind(this));
};

SerialComms.prototype.close = function () {
	this._port.close();
	this.emit('close');
};

SerialComms.prototype.monitor = function() {
	this._port.on('data', function(data) {
		process.stdout.write(data);
   	});
};

module.exports = SerialComms;
