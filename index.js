/**
 * Created by allenshow on 7/4/15.
 */

var net=require('net');
var Client=require('./lib/client');
var Server=require('./lib/server');

exports.createServer=function(options){
    return new Server(options);
}

exports.createClient=function(options){
    var socket=net.createConnection(options);
    return new Client(socket);
}

exports.Client=Client;
exports.Server=Server;