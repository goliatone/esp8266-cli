'use strict';

var commands = require('../bin/cmds');

module.exports.portIsSet = function(){

    if(commands.spinner) commands.spinner.stop();

    if(commands.PortManager.getSync()) return;
	console.warn('\n*******************************************');
	console.warn('It appears that you forgot to set');
	console.warn('a port for esp.');
	console.warn('');
	console.log('You have to run "esp port list"');
	console.log('and then "esp port set <port>"');
	console.warn('');
	console.log('On a Mac computer the command usually is:');
	console.warn('');
	console.log('esp port set /dev/cu.SLAB_USBtoUART');
	console.warn('');
	console.warn('*******************************************');
};

module.exports.oldPortIsSet = function(){
    var join = require('path').join,
        resolve = require('path').resolve;
    var oldpath = resolve(join(__dirname, '..', 'bin', '.port'));
    if(!module.exports.existsSync(oldpath)) return;
    console.warn('\n*******************************************');
	console.warn('node-esp has changed some of its configurations.');
	console.warn('You have to run "esp port list"');
	console.warn('and then "esp port set <port>"');
	console.warn('');
    console.warn('Event if you did set the port before you need to');
    console.warn('do it again.');
	console.warn('');
	console.log('On a Mac computer the command usually is:');
	console.warn('');
	console.log('esp port set /dev/cu.SLAB_USBtoUART');
	console.warn('');
	console.warn('*******************************************');
    process.exit(0);
};

var fs = require('fs');

module.exports.existsSync = fs.existsSync || function existsSync(filePath){
  try{
    fs.statSync(filePath);
  }catch(err){
    if(err.code == 'ENOENT') return false;
  }
  return true;
};
