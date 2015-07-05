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

client.on('timeout',function(){
    console.log('timeout')
})

client.setTimeout(3000);