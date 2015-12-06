'use strict';
var fs = require('fs');

module.exports = function(filepath){
    function getPort(){
        return new Promise(function(resolve, reject){
            var args = process.argv.slice(2),
        		port;

        	if (!fs.existsSync(filepath)) {
                reject();
        	} else port = '' + fs.readFileSync(filepath);

            resolve(port, 'get');
        });
    }

    function setPort(port){
        return new Promise(function(resolve, reject){
            fs.writeFile(filepath, port, function(err){
                if(err) return reject(err);
                resolve(port, 'set');
            });
        });
    }

    function listPorts(){
        return new Promise(function(resolve, reject){
            require('serialport').list(function(err, ports){
                if(err) return reject(err);
                resolve(ports);
            });
        });

    }
    return {
        get: getPort,
        set: setPort,
        list: listPorts
    };
};
