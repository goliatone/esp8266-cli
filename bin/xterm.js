var stdout = process.stdout;

var info = console.info;
var warn = console.warn;
var error = console.error;

var DEFAULT = "\033[m";
var BLUE = "\033[1;36m";
var YELLOW = "\033[1;33m";
var RED = "\033[1;31m";

console.info = function () {
	var args = Array.prototype.slice.call(arguments);
	stdout.write(BLUE);
	info.apply(this, args);
	stdout.write(DEFAULT);
};
console.warn = function () {
	var args = Array.prototype.slice.call(arguments);
	stdout.write(YELLOW);
	warn.apply(this, args);
	stdout.write(DEFAULT);
};
console.error = function () {
	var args = Array.prototype.slice.call(arguments);
	stdout.write(RED);
	error.apply(this, args);
	stdout.write(DEFAULT);
};

module.exports = console;
