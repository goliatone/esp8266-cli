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
	.description('Manage serial port configuration. Valid <cmd>\'s: get|set|list')
	.action(function(cmd, port, options){
		if(! commands.port.hasOwnProperty(cmd)){
			unrecognizedCommand('Unrecognized command ' + cmd);
		}
		commands.port[cmd](port);
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

		if(! commands.file.hasOwnProperty(cmd)){
			unrecognizedCommand('Unrecognized command ' + cmd);
		}
		//TODO should we take "write -c" option? compile?
		//it would load the file, compile it and remove the lua?
		commands.file[cmd](filename, destination);
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
	.description('Shows print statements from port ' + port + '.\n\nPress ^C to stop.')
	.action(function(){
		commands.monitor();
	});

program
	.command('fsinfo')
	.description('Shows information about the file system.')
	.action(function(cmd){
		commands.fsinfo();
	});

program
	.command('info <cmd>')
	.description('Shows different information about the system.')
	.action(function(cmd){
		if(! commands.info.hasOwnProperty(cmd)){
			unrecognizedCommand('Unrecognized command ' + cmd);
		}
		commands.info[cmd]();
	});


//wifi management
//node.restore() --Added on 07/04/2015

//Get IP:
// if wifi.getmode() == 1 then print(wifi.sta.getip()) else print(wifi.ap.getip()) end

//Get mac?

//get list of networks?!


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

program.parse(process.argv);

function unrecognizedCommand(msg){
	console.error(msg);
	process.exit(1);
}
