'use strict';
var spawn = require('child_process').spawn;

var join = require('path').join,
    resolve = require('path').resolve;

/**
 * esptool.py --port=/dev/cu.SLAB_USBtoUART write_flash -fm=dio -fs=32m -ff=40m 0x00000 ../nodemcu_integer_0.9.6-dev_20150627.bin
 * @param  {String}   port     Comm port.
 * @param  {String}   firmware Path to NodeMCU firmware
 * @param  {Function} cb
 */
function write_flash (port, firmware, cb){
    var scriptpath = resolve(join(__dirname, '../scripts/esptool.py'));
    var args = [scriptpath,
        '-p', port,
        'write_flash',
        '-fm=dio',
        '-fs=32m',
        '-ff=40m',
        '0x00000',
        firmware //../nodemcu_integer_0.9.6-dev_20150627.bin
    ];

    var command = spawn('python', args);

    return new Promise(function(resolve, reject){
        command.stdout.on('data', function (data) {
            cb(null, '' + data);
        });

        command.stderr.on('data', function (data) {
            cb('' + data);
        });

        command.on('close', function(code){
            if(code !== 0) reject(code);
            else resolve();
        });
    });
}

module.exports = write_flash;
