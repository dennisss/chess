// Chess client code

'use strict';


var io = require('socket.io-client'),
	RPC = require('./rpc'),
	_ = require('underscore');

/*

A Socket instance is returned for the namespace specified by the pathname in the URL, defaulting to /. For example, if the url is http://localhost/users, a transport connection will be established to http://localhost and a Socket.IO connection will be established to /users.
*/

/**
 * Client-side connection to the server
 *
 * @extends RPC
 */
class Client extends RPC {

	constructor(url, options){

		var socket = io((url || undefined), _.extend({
			/*transports: ['websocket'],*/
			path: '/socket'
		}, options || {}));

		socket.on('connect_error', function(err){
			console.log(err);
		})

		super(socket);
	}



};

module.exports = Client;
