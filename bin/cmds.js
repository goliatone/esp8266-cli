#!/usr/bin/env node


var SerialComms = require('../src/SerialComms'),
	DeviceManager = require('../src/DeviceManager'),
	Espytool = require('../src/Espytool'),
	PortManager = require('../src/PortManager')(__dirname + '/.port'),
	fs = require('fs');

var Commands = {
	pretty: true,
	stdout: console.log.bind(console),
	stderr: console.error.bind(console),
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
			return DeviceCommand('getFileList', null);
		},
		remove: function (filename) {
			return DeviceCommand('removeFile', [filename], true);
		},
		//Should this be upload?
		write: function (filename, destination) {
			var data = '' + fs.readFileSync(filename),
				pathLib = require('path'),
				//TODO: For HTML/CSS/JS files, we might want to mimik
				//filesystem so that if we upload folder, we should
				//have option to keep directory structure.
				basename = pathLib.basename(destination || filename);

			return DeviceCommand('writeFile', [basename, data], true);
		},

		push: function (filename, destination) {
			var data = '' + fs.readFileSync(filename),
				pathLib = require('path'),
				//TODO: For HTML/CSS/JS files, we might want to mimik
				//filesystem so that if we upload folder, we should
				//have option to keep directory structure.
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
			return DeviceCommand('writeFile', [basename, data], true);
		},
		read: function (filename) {
			return DeviceCommand('readFile', [filename], true)
				.then(function (data) { return data.replace(/\r\n\r\n/g, '\n'); });
		},
		execute: function (filename) {
			return DeviceCommand('executeFile', [filename], true);
		}
	},
	restart: function () {
		return DeviceCommand('restart', null);
	},
	run: function (lua) {
		return DeviceCommand('executeLua', [lua], true);
	},
	monitor: function() {
		var port = PortManager.getSync();

		return new Promise(function(resolve, reject){
			if(!port) return reject(new Error('Port not available.'));

			console.log('Displaying output from port: ' + port + '.');
			console.log('Press ^C to stop.\n');

			//This promise does not resolve, we just leave the connection
			//open.
			new SerialComms(port).on('ready', function (comms) {
				comms.monitor();
			});
		});
	},
	fs: {

		info: function(){
			return DeviceCommand('fsInfo', null);
		},
		format: function(){
			return DeviceCommand('fsFormat', null);
		}
	},
	info: {
		heap: function(){
			return DeviceCommand('infoHeap', null);
		},
		flash: function(){
			return DeviceCommand('infoFlashId', null);
		},
		build: function(){
			//TODO: Format build info!
			return DeviceCommand('infoBuild', null);
		},
		chip: function(){
			return DeviceCommand('infoChipId', null);
		}
	},
	wifi: {
		restore: function(){
			return DeviceCommand('wifiRestore', null);
		},
		getip: function(){
			return DeviceCommand('wifiIP', null);
		}
	},
	esptool: {
		flash: function(firmware){
			var port = PortManager.getSync();
			return Espytool(port, firmware, function(err, output){
				//TODO: How do we handle feedback? pass in stedout, stderr?
				if(err){
					Commands.stderr('PYTHON ERROR:');
					Commands.stderr(err);
				}
				//Here we should emit progress event instead:
				else Commands.stdout(output);
			});
		}
	}
};


function DeviceCommand(cmd, args){
	var Spinner = require('chalk-cli-spinner');

	var s = Commands.pretty ? new Spinner() : {stop:function(){}};

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



module.exports = Commands;
module.exports.PortManager = PortManager;
