// Chess client code

'use strict';


var io = require('socket.io-client'),
	RPC = require('./rpc');

/*

A Socket instance is returned for the namespace specified by the pathname in the URL, defaulting to /. For example, if the url is http://localhost/users, a transport connection will be established to http://localhost and a Socket.IO connection will be established to /users.
*/

class Client {

	constructor(url, options){

		this.socket = io((url || undefined), _.extend({
			/*transports: ['websocket'],*/
			path: '/socket'
		}, options || {}));

		this.socket.on('connect_error', function(err){
			console.log(err);
		})

		this.proc =  new RPC(this.socket);
	}



};

module.exports = Client;
