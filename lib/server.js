/**
 * Created by allenshow on 7/4/15.
 */

var net=require('net');
var util=require('util');
var EventEmitter=require('events').EventEmitter;
var Client=require('./client');

var Server=function(options){

    this.server=net.createServer(options);
    this.server.on('connection',connectionHandler.bind(this));
    this.server.on('listening',this.emit.bind(this,'ready'));
    this.server.on('close',this.emit.bind(this,'close'));
    this.server.on('error',this.emit.bind(this,'error'));
}

module.exports=Server;

util.inherits(Server,EventEmitter);

function connectionHandler(conn){
    var client=new Client(conn);
    this.emit('clientConnected',client);
}

Server.prototype.listen=function(){
    this.server.listen.apply(this.server,arguments);
}

Server.prototype.address=function(){
    return this.server.address();
}

Server.prototype.close=function(){
    this.server.close();
}