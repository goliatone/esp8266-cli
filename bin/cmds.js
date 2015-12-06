#!/usr/bin/env node

var fs = require('fs'),
	SerialComms = require('../src/SerialComms'),
	DeviceManager = require('../src/DeviceManager'),
	PORT_FILENAME = __dirname + '/port.txt';

var args = process.argv.slice(2),
	port,
	success;


if (args[0] == 'port' && args[1] == 'set') {
 //NOOP
}
else if (!fs.existsSync(PORT_FILENAME)) {
	console.log ('Serial port not configured.\nPlease use "esp port set <port_address>" to configure.');
	process.exit();
} else {
	port = '' + fs.readFileSync(PORT_FILENAME);
}

var commands = {
	port: {
		set: function (port) {
			fs.writeFileSync(PORT_FILENAME, port);
		},
		get: function () {
			console.log ('Port:', port || '[not set]');
		},
		list: function(){
			require('serialport').list(function(err, ports){
				console.log(ports);
			});
		}
	},
	file: {
		list: function () {
			return new SerialComms(port).on('ready', function (comms) {
				new DeviceManager(comms).getFileList()
					.then(function (files) {
						for (var i = 0, file; file = files[i]; i++) {
							size = '' + file.size;
							size = '        '.substr(size.length) + size;
							console.log (size + ' bytes  ' + file.filename);
						}
					})
					.then(comms.close.bind(comms));
			});
		},
		remove: function (filename) {
			return new SerialComms(port).on('ready', function (comms) {
				new DeviceManager(comms).removeFile(filename)
					.then(comms.close.bind(comms));
			});
		},
		write: function (filename, destination) {
			var data = '' + fs.readFileSync(filename),
				pathLib = require('path'),
				basename = pathLib.basename(destination || filename);

			new SerialComms(port).on('ready', function (comms) {
				new DeviceManager(comms).writeFile(basename, data)
					.then(comms.close.bind(comms));
			});
		},
		push: function (filename, destination) {
			var data = '' + fs.readFileSync(filename),
				pathLib = require('path'),
				basename = pathLib.basename(destination || filename),
				match = filename.match(/\.([^\.]+)$/);

			if (match) {
				switch (match[1]) {
					case 'lua':
						data = require('luamin').minify(data);
						break;

					case 'html':
						data = require('html-minifier').minify(data, {
							removeComments: true,
							collapseWhitespace: true,
							removeRedundantAttributes: true,
							minifyJS: true,
							minifyCSS: true
						});
						break;

					case 'js':
						data = require('uglify-js').minify(data, {fromString: true}).code;
						break;

					case 'css':
						data = (new (require('clean-css'))).minify(data).styles;
						break;
				}
			}

			return new SerialComms(port).on('ready', function (comms) {
				new DeviceManager(comms).writeFile(basename, data)
					.then(comms.close.bind(comms));
			});
		},
		read: function (filename) {
			return new SerialComms(port).on('ready', function (comms) {
				new DeviceManager(comms).readFile(filename)
					.then(function (data) { return data.replace(/\r\n\r\n/g, '\n'); })
					.then(console.log)
					.then(comms.close.bind(comms));
			});
		},
		execute: function (filename) {
			return new SerialComms(port).on('ready', function (comms) {
				new DeviceManager(comms).executeFile(filename)
					.then(console.log)
					.then(comms.close.bind(comms));
			});
		}
	},
	restart: function () {
		return new SerialComms(port).on('ready', function (comms) {
			new DeviceManager(comms).restart()
				.then(comms.close.bind(comms));
		});
	},
	run: function (lua) {
		return new SerialComms(port).on('ready', function (comms) {
			new DeviceManager(comms).executeLua(lua)
				.then(console.log)
				.then(comms.close.bind(comms));
		});
	},
  	monitor: function() {
		console.log("Displaying output from port " + port + ".");
		console.log("Press ^C to stop.\n");

		return new SerialComms(port).on('ready', function (comms) {
			comms.monitor();
		});
  	},
	fsinfo: function(){
		return new SerialComms(port).on('ready', function(comms){
			new DeviceManager(comms).fsinfo()
				.then(console.log)
				.then(comms.close.bind(comms));
 		});
	},
	info: {
		heap: function(){
			return new SerialComms(port).on('ready', function(comms){
				new DeviceManager(comms).infoHeap()
					.then(console.log)
					.then(comms.close.bind(comms));
	 		});
		},
		flash: function(){
			return new SerialComms(port).on('ready', function(comms){
				new DeviceManager(comms).infoFlashId()
					.then(console.log)
					.then(comms.close.bind(comms));
	 		});
		},
		build: function(){
			return new SerialComms(port).on('ready', function(comms){
				new DeviceManager(comms).infoBuild()
					.then(console.log)
					.then(comms.close.bind(comms));
	 		});
		},
		chip: function(){
			return new SerialComms(port).on('ready', function(comms){
				new DeviceManager(comms).infoChipId()
					.then(console.log)
					.then(comms.close.bind(comms));
	 		});
		}
	}
};

module.exports = commands;
