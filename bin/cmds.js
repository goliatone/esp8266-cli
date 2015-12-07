#!/usr/bin/env node


var SerialComms = require('../src/SerialComms'),
	DeviceManager = require('../src/DeviceManager'),
	Espytool = require('../src/Espytool'),
	PortManager = require('../src/PortManager')(__dirname + '/.port'),
	fs = require('fs');

var commands = {
	port: {
		set: function (port) {
			return PortManager.set(port);
		},
		get: function () {
			return PortManager.get().catch(function(err){
				console.log ('Serial port not configured.\nPlease use "esp port set <port_address>" to configure.');
        		process.exit();
			});
		},
		list: function(){
			return PortManager.list();
		}
	},
	file: {
		list: function () {
			return Command('getFileList', null, true);
			return new SerialComms(getPort()).on('ready', function (comms) {
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
			return Command('removeFile', [filename], true);
		},
		//Should this be upload?
		write: function (filename, destination) {
			var data = '' + fs.readFileSync(filename),
				pathLib = require('path'),
				basename = pathLib.basename(destination || filename);

			return Command('writeFile', [basename, data], true);
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
			return Command('writeFile', [basename, data], true);
		},
		read: function (filename) {
			return Command('readFile', [filename], true)
				.then(function (data) { return data.replace(/\r\n\r\n/g, '\n'); });
		},
		execute: function (filename) {
			return Command('executeFile', [filename], true);
		}
	},
	restart: function () {
		return Command('restart', null, true);
	},
	run: function (lua) {
		return Command('executeLua', [lua], true);
	},
  	monitor: function() {
		var port = PortManager.getSync();
		console.log("Displaying output from port: " + port + ".");
		console.log("Press ^C to stop.\n");

		return new SerialComms(port).on('ready', function (comms) {
			comms.monitor();
		});
  	},
	fs: {

		info: function(){
			return Command('fsInfo', null, true);
		},
		format: function(){
			return Command('fsFormat', null, true);
		}
	},
	info: {
		heap: function(){
			return Command('infoHeap', null, true);
		},
		flash: function(){
			return Command('infoFlashId', null, true);
		},
		build: function(){
			return Command('infoBuild', null, true);
		},
		chip: function(){
			return Command('infoChipId', null, true);
		}
	},
	wifi: {
		restore: function(){
			return Command('wifiRestore', null, true);
		},
		getip: function(){
			return Command('wifiIP', null, true);
		}
	},
	esptool:{
		flash: function(firmware){
			var port = PortManager.getSync();
			return Espytool(port, firmware, function(err, output){
				//TODO: How do we handle feedback? pass in stedout, stderr?
				if(err){
					console.error('PYTHON ERROR:');
					
					console.error(err);
				}
				else console.log(output);
			});
		}
	}
};


function Command(cmd, args, pretty){
	var Spinner = require('chalk-cli-spinner');
	var s = pretty ? new Spinner() : {stop:function(){}};

	return new Promise(function(resolve, reject){
		var port = PortManager.getSync();
		if(port === false) return reject();

		new SerialComms(port).on('ready', function(comms){
			new DeviceManager(comms).execute(cmd, args)
				.then(function(res){
					s.stop();
					resolve(res);
				})
				.then(comms.close.bind(comms));
		}).on('error', function(err){
			console.log('Ensure your port is not busy');
			reject(err);
		});
	});
}



module.exports = commands;
