#!/usr/bin/env node

'use strict';


var program = require('commander'),
	pkg = require('../package'),
	commands = require('./cmds');

var port = 'getport',
	success;

/**********************************
 * NOTIFY IF WE HAVE NEW VERSION.
**********************************/
var notifier = require('update-notifier')({
	pkg: {name: pkg.name, version: pkg.version},
	callback: function(err, update){
		if(!update || update.type === 'latest') return;
		notifier.update = update;
		notifier.notify();
	}
});

program
	.option('-v, --verbose')
	.option('-r, --raw')
	.version(pkg.version);

/**
 * port
 * - Get
 * - Set
 */
program
	.command('port <cmd> [port]')
	.description('Manage serial port configuration. Valid <cmd>\'s: get|set|list')
	.action(function(cmd, port, options){
		if(! commands.port.hasOwnProperty(cmd)){
			unrecognizedCommand('Unrecognized command ' + cmd);
		}
		commands.port[cmd](port).then(function(res){
			if(cmd === 'list'){
				require('../src/listFiles')({
					'Port Name': 'comName',
					'Manufacturer': 'manufacturer'
				}, [40, 40])(res);
			} else console.log ('Port:', res);
		});
	});

program
	.command('file <cmd> [filename] [destination]')
	.description('Manage files. Valid <cmd>\'s:' +
		'\n\tlist: Show a list all files in the board' +
		'\n\tremove [filename]: Remove the file [filename] from the board' +
		'\n\twrite [filename] [destination]: Write the local file [filename]' +
		'\n\t\tas [destination] in the board. If [destination] is not given' +
		'\n\t\tfile will be have the same name.' +
		//TODO: Rename to compress
		'\n\tpush [filename] [destination]: Comress and write the local file' +
		'\n\t\t[filename] as [destination] in the board.' +
		'\n\t\tIt will check for the file\'s extension and use an appropiate compressor.' +
		'\n\t\tSupported filetypes are: lua, html, js, and css.' +
		'\n\tread [filename]: Read [filename] from the board and show in stdout.' +
		'\n\texecute [filename]: Execute [filename] in the board using "dofile".\n'
	)
	.action(function(cmd, filename, destination, options){

		if(! commands.file.hasOwnProperty(cmd)){
			unrecognizedCommand('Unrecognized command ' + cmd);
		}
		//TODO should we take "write -c" option? compile?
		//it would load the file, compile it and remove the lua?
		commands.file[cmd](filename, destination).then(function(res){
			if(cmd === 'list'){
				require('../src/listFiles')({
					'File': 'filename',
					'Size (bytes)': 'size'
				})(res);
			} else console.log (res);
		});
	});

program
	.command('restart')
	.description('Restarts the board.')
	.action(function(){
		commands.restart().then(function(){
			console.log('Board restarted');
		});
	});

program
	.command('run [lua]')
	.description('Runs the [lua] command')
	.action(function(lua){
		commands.run(lua).then(function(res){
			console.log(res);
		});
	});

program
	.command('monitor')
	.description('Shows print statements from port ' + port + '.\n\nPress ^C to stop.')
	.action(function(){
		commands.monitor().catch(function(err){
			console.error('Error starting monitor function.', err.message);
		});
	});

program
	.command('fs')
	.description('Interact with the filesystem. Valid <cmd>\'s:' +
		'\n\tinfo: Show information about the fylesistem.' +
		'\n\tformat: Formats the board removing all files.\n'
	)
	.action(function(cmd){
		if(! commands.fs.hasOwnProperty(cmd)){
			unrecognizedCommand('Unrecognized command ' + cmd);
		}
		commands.fs[cmd]().then(function(res){
			console.log(res);
		});
	});

program
	.command('info <cmd>')
	.description('Shows different information about the system.'
	 + '\n\tValid commands: heap|flash|build|chip'
	)
	.action(function(cmd){
		if(! commands.info.hasOwnProperty(cmd)){
			unrecognizedCommand('Unrecognized command ' + cmd);
		}
		commands.info[cmd]().then(function(res){
			console.log(res);
		});
	});


program
	.command('wifi <cmd>')
	.description('Manage WiFi settings. Valid <cmd>\'s: restore|getip')
	.action(function(cmd){
		if(! commands.wifi.hasOwnProperty(cmd)){
			unrecognizedCommand('Unrecognized command ' + cmd);
		}
		commands.wifi[cmd]().then(function(res){
			console.log(res);
		});
	});

program
	.command('flash <firmware>')
	.description('Flash the board with the given firmware.' +
		'\n\<firmware>: Must be a valid path to a _release_.bin'
	)
	.action(function(firmware){
		if(!firmware){
			unrecognizedCommand('Need to provide path to firmware.');
		}
		commands.esptool.flash(firmware).then(function(res){
			// if(cmd==='flash'){
			// //Actually, this does not get progress info :/
			// 	//var progress = require('smooth-progress');
			// 	//
			// } else
			console.log(res);
		});
	});

// program
// 	.command('repl')
// 	.description('Starts an interactive REPL to send commands to the board')
// 	.action(function(){
// 		console.log('ESP >');
// 	});

/*
 * Other commands?
 */
program
    .command('*')
    .action(function(cmd){
    	console.error('Unknown command:', cmd);
		setTimeout(program.outputHelp.bind(program), 500);
    });

if(process.argv.length === 2) program.outputHelp();

program.parse(process.argv);



function unrecognizedCommand(msg){
	console.error(msg);
	process.exit(1);
}
