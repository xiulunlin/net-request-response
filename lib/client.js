/**
 * Created by allenshow on 7/4/15.
 */

var Buffer=require('buffer').Buffer;
var util=require('util');
var net=require('net');
var EventEmitter=require('events').EventEmitter;
var Stream=require('./stream');
var ResponseQueue=require('./response-queue');

var Client=function(socket){
    this.socket=socket?socket:new net.Socket();
    this.socket.on('close',this.emit.bind(this,'close'));
    this.socket.on('connect',this.emit.bind(this,'connect'));
    this.socket.on('error',this.emit.bind(this,'error'));
    this.socket.on('timeout',this.emit.bind(this,'timeout'));
    this.socket.on('data',this.emit.bind(this,'data'));

    this.socket.on('data',rawdataHandler.bind(this));

    this.stream=new Stream();
    this.stream.on('message',messageHandler.bind(this));

    this.reponseQueue=new ResponseQueue();
}

util.inherits(Client,EventEmitter);

module.exports=Client;

function rawdataHandler(data){
    this.stream.pipe(data);
}

function messageHandler(packet){
    //it is a resquest
    if(packet.type === 0){
        this.emit('onRequest',packet.payload,response.bind(this,packet.sequenceNumber));
    }
    //it is a response
    if(packet.type ===1 ){
        this.reponseQueue.exec(packet.sequenceNumber,packet.payload);
    }
}

function response(sequenceNumber,payload){
    var seqBuf=new Buffer(2);
    seqBuf.writeUInt16BE(sequenceNumber+32768);

    var pl=typeof payload === 'string'? new Buffer(payload) : payload;

    var length=pl.length;
    var bufs=[];
    remainingLengthBufs(length,bufs);

    bufs.unshift(seqBuf);
    bufs.push(pl);

    var buf=Buffer.concat(bufs);

    this.socket.write(buf);
}

Client.prototype.send=function(payload,onResponse){

    var seqBuf=new Buffer(2);
    var sequenceNumber=this.reponseQueue.getSeqNumber();
    if(sequenceNumber ===null){
        var error=new Error('Reach the max request queue size: 32767');
        if(onResponse){
            onResponse(error);
        }
        return;
    }
    seqBuf.writeUInt16BE(sequenceNumber || 0);

    var pl=typeof payload === 'string'? new Buffer(payload) : payload;

    var length=pl.length;
    var bufs=[];
    remainingLengthBufs(length,bufs);

    bufs.unshift(seqBuf);
    bufs.push(pl);

    var buf=Buffer.concat(bufs);

    this.socket.write(buf);

    if(onResponse){
        this.reponseQueue.enQueue(onResponse);
    }
}

Client.prototype.connect=function(){
    var args=Array.prototype.slice.call(arguments);
    var lastArg=args[args.length-1];
    if(typeof lastArg === 'function'){
        args[args.length-1]=lastArg.bind(this);
    }
    this.socket.connect.apply(this.socket,args);
}

Client.prototype.setTimeout=function(timeout){
    this.socket.setTimeout(timeout);
}

Client.prototype.address=function(){
    return this.socket.address();
}

Client.prototype.destroy=function(){
    this.socket.destroy();
}

Client.prototype.setResponseTimeout=function(timeout){
    //not support yet
}

function remainingLengthBufs(quotient,bufs){

    if(quotient>=128){
        var reamainder=quotient%128;
        var buffer=new Buffer(1);
        buffer.writeUInt8(reamainder + 128);
        bufs.unshift(buffer);

        var quotient=(quotient-reamainder)/128;
        remainingLengthBufs(quotient,bufs);
    }else{
        var buffer=new Buffer(1);
        buffer.writeUInt8(quotient + 128);
        bufs.unshift(buffer);

        var length=bufs.length;
        (bufs[length-1])[0]=(bufs[length-1])[0] & 0x7F;
    }
}