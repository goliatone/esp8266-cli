'use strict';

var Table = require('cli-table');


module.exports = function(fields, colWidths){

    var headers = Object.keys(fields);
    colWidths = colWidths || [40, 20]

    return function(data){

        var table = new Table({
            head: headers,
            colWidths: colWidths
        });

        var out;
        data.map(function(file){
            out = [];
            Object.keys(fields).map(function(field){
                out.push(file[fields[field]]);
            });

            table.push(out);
        });

        console.log(table.toString());
    };
};
