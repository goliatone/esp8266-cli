'use strict';
var spawn = require('child_process').spawn;

var join = require('path').join,
    resolve = require('path').resolve;

/*
We might get an error like this one, which means that
the comm port is busy. Make it useful and easy to grok :)

Traceback (most recent call last):
  File ".../scripts/esptool.py", line 724, in <module>


    main()
  File ".../scripts/esptool.py", line 575, in main
    esp = ESPROM(args.port, args.baud)
  File ".../scripts/esptool.py", line 66, in __init__
    self._port = serial.Serial(port)
  File "build/bdist.macosx-10.9-x86_64/egg/serial/serialutil.py", line 282, in __init__
  File "build/bdist.macosx-10.9-x86_64/egg/serial/serialposix.py", line 289, in open
OSError: [Errno 16] Resource busy: '/dev/cu.SLAB_USBtoUART'
*/

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
        // '-fm=dio',
        // '-fs=32m',
        // '-ff=40m',
        '0x00000',
        firmware //../nodemcu_integer_0.9.6-dev_20150627.bin
    ];

    var command = spawn('python', args);

    return new Promise(function(resolve, reject){
        command.stdout.on('data', function (data) {
            //Parse:
            //Connecting...
            // Erasing flash...
            // ==> Writing at 0x%08x... (%d %%) <==
            // Wrote 400384 bytes at 0x00000000 in 38.5 seconds (83.1 kbit/s)...
            //
            // Leaving...
            cb(null, '' + data);
        });

        command.stderr.on('data', function (data) {
            cb('' + data);
        });

        command.on('close', function(code){
            if(code !== 0) reject(code);
            else resolve();
        });
        command.on('error', function(err){
            reject(err);
        })
    });
}

module.exports = write_flash;
