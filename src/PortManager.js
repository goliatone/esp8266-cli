'use strict';
var fs = require('fs');

module.exports = function(filepath){
    function getPort(){
        return new Promise(function(resolve, reject){
            var args = process.argv.slice(2),
        		port;

        	if (!fs.existsSync(filepath)) {
                //TODO: Remove message from here.
                reject(new Error('Port not set. Please set your port using "esp port set"'));
        	} else port = '' + fs.readFileSync(filepath);

            resolve(port, 'get');
        });
    }

    function getPortSync(){
        if(!fs.existsSync(filepath)) return false;
        return '' + fs.readFileSync(filepath);
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
        getSync: getPortSync,
        set: setPort,
        list: listPorts
    };
};
