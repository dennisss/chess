// Chess client code


var io = require('socket.io-client'),
	RPC = require('./rpc');

var socket = io({
	/*transports: ['websocket'],*/
	path: '/socket'
});

var proc = new RPC(socket);


module.exports = {

	proc: proc,
	socket: socket

};
