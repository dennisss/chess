// Chess client code


var io = require('socket.io-client'),
	RPC = require('./rpc');

var socket = io({
	/*transports: ['websocket'],*/
	path: '/socket'
});

var proc = new RPC(socket);

proc.call('join', {room: 'Hello', name: 'Dennis', level: 'Jedi'}, function(err, data){

	console.log(err);

	console.log(data);


})


module.exports = {

	proc: proc,
	socket: socket

};
