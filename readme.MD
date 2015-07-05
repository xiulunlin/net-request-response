
## Net-Request-Response

It is a node module implements request-response model with for net.socket to make communication quicker and easier. It uses a custom protocol.

### How to install

`npm install net-request-response`

## Quick Start
	var nrr = require('../index');

	//server

	var server = nrr.createServer();

	server.on('clientConnected', function (client) {
    	client.on('onRequest', function (payload, response){
        	console.log('Message from client: '+payload.toString());
        	//response
        	response('Okay, I am server.');
    	});
	});
	
	server.listen(8080);
	
	//client
	
	var client =new nrr.Client();
	
	client.connect(8080);

	client.on('connect', function () {

    	//send a string or buffer
    	this.send('Hello, I am client.', function (error, responsePayload){
        	if (error) {
            	console.log(error);
            	return;
        	}
        	console.log('Response from server: '+responsePayload.toString());
    	});
	})

## API
### Net-Request-Reponse Methods
#### createServer(options)
`options` see nodejs document [net.createServer](https://nodejs.org/api/all.html#all_net_createserver_options_connectionlistener).  
`callback` is not supported, use `clientConnected` event instead.


#### createClient(options)

`options` see nodejs document [net.createConnection](https://nodejs.org/api/all.html#all_net_createconnection_options_connectionlistener).  
`callback` is not supported, use `connect` event instead.
#### Client

`new nrr.Client()` can also be used to create a new client and then you can invoke `client.connect()` to connect lately

### Server Events

`server` will emit some events about the state of qtpServer
#### 'ready'

`server` will emit `ready` event once the `server` is listening correctly  
 							
 	server.on('ready',function(){
 		console.log(this.address())
 	});
#### 'clientConnected'
`server` will emit `clientConnected` event if a client is connected to this server. A `client` object will be passed as an argument

	server.on('clientConnected',function(client){
 		//handler client here
 	});
 	
#### 'error'
`server` will emit `error` event when an error was caught. An `error` object will be passed as an argument
#### 'close'
Fired when `server` is closed and stopped from listening
### Server Methods
#### listen(options)
`options` see nodejs document [net.Server.listen](https://nodejs.org/api/all.html#all_server_listen_port_host_backlog_callback). `Callback` is not supported, use 'ready' event instead.
#### close()
See nodejs document [net.Server.close](https://nodejs.org/api/all.html#all_server_close_callback)
#### address()
Return an address object
### Client Events
`client` will emit some events when a request or response was handled
####'onRequest'
`client` will emit `onRequest` event when it receives request from another side of socket with arguments `payload` and `reponse`:

* `payload`. Buffer.
* `response`. A function to call if you want to response this request.

<b></b> 

	client.on('onRequest',function(payload,response){
		console.log(payload);
		//response with a buffer or string
		response('message received');
	});
 		
#### 'data'
raw tcp data will be passed to `data` event

	client.on('data',function(data){
		//raw tcp data, including header
 		console.log(data);
 	});
 	
#### 'error'
`client` will emit `error` event when an error was caught. An `error` object will be passed as an argument
#### 'close'
fired when `client` is closed
### Client Methods
#### send(payload,onResponse)  
A request can be sent either on server side or client side

* `payload`. Buffer or String to be sent.
* `onResponse`. Function, it get invoked with arguments `error` and `payload` if a response is received.

<b></b>
		
	client.send('Hello',function(error,payload){
    	//get response
    	if(error){
    		console.log(error);
    		return;
    	}
    		
    	//payload is buffer
    	console.log(payload);
	});
#### close()
## Message Format
* `type`: qtp use the first `1` bit to mark `request` and `response`: 0 for request and 1 for response
* `sequenceNumber`: the next `15` bits is `sequenceNumber` which is used to distinguish different messages, it is automatically increased by 1 everytime and it will be reset to 0 if it reaches 32768
* `remainingLength`: It stands for the length of message body and it is extendible. The first `1` bit of every byte is to mark the end of header (when the bit is 0) 
      
      `00000101`           means length 5
      `10000001 00000010`  means length 129   (1*2^7 + 2)
* `payload`: Message body

