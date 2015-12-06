#!/usr/bin/env node

'use strict';


var program = require('commander'),
	pkg = require('../package'),
	commands = require('./cmds'),
	PORT_FILENAME = __dirname + '/port.txt';


var port = 'getport',
	success;

program
	.option('-v, --verbose')
	.version(pkg.version);


/**
 * port
 * - Get
 * - Set
 */
program
	.command('port <cmd> [port]')
	.description('Manage serial port configuration. Valid <cmd>\'s: get|set')
	.action(function(cmd, port, options){
		//validate command
		switch (cmd) {
			case 'get':
				commands.port.get();
				break;
			case 'set':
				commands.port.set(port);
				break;
			default:
				console.error('Wrong!')
				process.exit(1);
		}
	});

program
	.command('file <cmd> [filename] [destination]')
	.description('Manage files. Valid <cmd>\'s:' +
		'\n\tlist: Show a list all files in the board' +
		'\n\tremove [filename]: Remove the file [filename] from the board' +
		'\n\twrite [filename] [destination]: Write the local file [filename] as [destination] in the board' +
		//TODO: Rename to compress
		'\n\tpush [filename] [destination]: Comress and write the local file [filename] as [destination] in the board.' +
		'\n\t\tIt will check for the file\'s extension and use an appropiate compressor.' +
		'\n\t\tSupported filetypes are: lua, html, js, and css.' +
		'\n\tread [filename]: Read [filename] from the board and show in stdout.' +
		'\n\texecute [filename]: Execute [filename] in the board using "dofile".\n'
	)
	.action(function(cmd, filename, destination, options){
		switch (cmd) {
			case 'list':
				commands.file.list();
				break;
			case 'remove':
				commands.file.remove(filename);
				break;
			case 'write':
				commands.file.write(filename, destination);
				break;
			case 'push':
				commands.file.push(filename, destination);
				break;
			case 'read':
				commands.file.read(filename, destination);
				break;
			case 'execute':
				commands.file.execute(filename, destination);
				break;
			default:
				console.error('Wrong!')
				process.exit(1);
		}
	});

program
	.command('restart')
	.description('Restarts the board.')
	.action(function(){
		commands.restart();
	});

program
	.command('run [lua]')
	.description('Runs the [lua] command')
	.action(function(lua){
		commands.run(lua);
	});

program
	.command('monitor')
	.description('Shows output from port ' + port + '.\n\nPress ^C to stop.')
	.action(function(){
		commands.monitor();
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
    });

program.parse(process.argv);
