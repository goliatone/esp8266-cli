'use strict';

var Promise = require('bluebird');

var CHUNK_SIZE = 128;

function DeviceManager (comms) {
	this._comms = comms;
}

DeviceManager.prototype.fsinfo = function(){
	//TODO: Should we print("["..t..","..u..","..r.."]")
	var command = 'r,u,t=file.fsinfo() print("Total : "..t.." bytes_NL_Used  : "..u.." bytes_NL_Remain: "..r.." bytes_NL_") r=nil u=nil t=nil';
	return this._sendCommand(command)
	.then(function (data) {
		return '' + data.replace(/_NL_/gm, '\r\n');
	});
};

DeviceManager.prototype.wifiIP = function(){
	var command = 'if wifi.getmode() == 1 then print(wifi.sta.getip()) else print(wifi.ap.getip()) end';
	return this._sendCommand(command);
};

DeviceManager.prototype.wifiRestore = function(){
	var command = 'node.restore()';
	return this._sendCommand(command);
};

DeviceManager.prototype.infoHeap = function(){
	var command = 'print(node.heap())';
	return this._sendCommand(command);
};

DeviceManager.prototype.infoFlashId = function(){
	var command = 'print(node.flashid())';
	return this._sendCommand(command);
};

DeviceManager.prototype.infoInfo = function(){
	// majorVer (number)
	// minorVer (number)
	// devVer (number)
	// chipid (number)
	// flashid (number)
	// flashsize (number)
	// flashmode (number)
	// flashspeed (number)
	var command = 'ma, mi, de, ch, fl, fs, fm, fp = node.info();print("["..ma..","..mi..","..de..","..ch..","..fl..","..fs..","..fm..","..fp.."]");';
	// var command = 'ma, mi, de, ch, fl, fs, fm, fp = node.info();print("["..ma..","..mi..","..de..","..ch..","..fl..","..fs..","..fm..","..fp.."]");ma=nil, mi=nil, de=nil, ch=nil, fl=nil, fs=nil, fm=nil, fp=nil';
	return this._sendCommand(command).then(function(data){
		return data.split('\t');
	});
};

DeviceManager.prototype.infoChipId = function(){
	var command = 'print(node.chipid())';
	return this._sendCommand(command);
};

DeviceManager.prototype.getFileList = function () {
	var command = 'for f,s in pairs(file.list()) do print(f,s) end';

	return this._sendCommand(command)
		.then(function (data) {
			var files = data.split('\r\n'),
				result = [],
				i, file;

			for (i = 0; file = files[i]; i++) {
				file = file.split('\t');
				result.push({ filename: file[0], size: file[1] });
			}

			return result;
		});
};

DeviceManager.prototype.removeFile = function (filename) {
	var command = 'file.remove"' + filename + '"';

	return this._sendCommand(command)
		.then(function (data) {
			return '' + data != '';
		});
};

DeviceManager.prototype.writeFile = function (filename, data) {
	return this.removeFile(filename)
		.then(this._writeFileHeader.bind(this, filename))
		.then(this._writeFileData.bind(this, data))
		.then(this._writeFileFooter.bind(this));
};

DeviceManager.prototype._writeFileHeader = function (filename, data) {
	var command = 'file.open("' + filename + '", "w")';
	return this._sendCommand(command);
};

DeviceManager.prototype._writeFileData = function (data) {
	var _this = this,
		chunked = [],
		chunk;

	data = '' + data;

	while (data.length) {
		chunk = data.substr(0, CHUNK_SIZE);
		data = data.substr(chunk.length);

		chunked.push(chunk);
	}

	return new Promise(function (resolve, reject) {
		function sendNextChunk () {
			if (!chunked.length) return resolve();
			_this._writeFileChunk(chunked.shift()).then(sendNextChunk);
		}

		sendNextChunk();
	});
};

DeviceManager.prototype._writeFileChunk = function (chunk) {
	var command,
		translate = { '\t': '\\t', '\n': '\\n', '\r': '\\r', '"': '\\"', '\\': '\\\\' };

	chunk = chunk.replace(/[\t\n\r"\\]/g, function (x) { return translate[x]; });
	command = 'file.write"' + chunk + '" file.flush()';

	return this._sendCommand(command);
};

DeviceManager.prototype._writeFileFooter = function () {
	var command = 'file.flush()file.close()';
	return this._sendCommand(command);
};

DeviceManager.prototype.readFile = function (filename) {
	// var command = '_view = function() local _line;if file.open("' + filename + '","r") then print("--FileView start"); repeat _line = file.readline(); if (_line~=nil) then print(string.sub(_line,1,-2)); end until _line==nil; file.close(); print("--FileView done.") end end _view();_view=nil';
	var command = 'file.open("' + filename + '","r")for line in file.readline do print(line) end file.close() line=nil';
	return this._sendCommand(command);
};

DeviceManager.prototype.executeFile = function (filename) {
	var command = 'dofile"' + filename + '"';
	return this._sendCommand(command);
};

DeviceManager.prototype.executeLua = function (lua) {
	return this._sendCommand(lua);
};

DeviceManager.prototype.restart = function (lua) {
	var command = 'node.restart()';
	return this._sendCommand(command);
};

DeviceManager.prototype._sendCommand = function (command) {
	var _this = this;

	return new Promise(function (resolve, reject) {
		_this._comms.once('response', resolve).send(command + '\r\n');
	});
};

module.exports = DeviceManager;
