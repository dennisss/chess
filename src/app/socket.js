'use strict';

var RPC = require('../rpc');



// Get users in a room
function userlist(io, room){
	var clients = io.sockets.adapter.rooms[room];

	return _.map(_.keys(clients), function(id){
		var c = io.sockets.connected[id]
		return c.profile;
	});

}



module.exports = function(server){

	var io = require('socket.io')(server, {
		path: '/socket',
		serveClient: false
	});

	io.on('connection', function(socket){

		var proc = new RPC(socket, true);


		/////// Room managment stuff

		proc.register('join', function(data, callback){

			var room = data.room;

			// Leave all other rooms
			_.map(socket.rooms, function(r){
				if(r != socket.id) // The user is by default in a room with the same name as their id
					socket.leave(r);
			});


			// Store profile and join the current room
			socket.profile = {
				name: data.name,
				level: data.level
			};
			socket.join(room);


			// Broadcast user list to other players
			var list = userlist(io, room);

			io.to(room).emit('userlist', list);

			callback(null, list);
		});


		proc.register('leave', function(data, callback){
			// TODO: There should only be one active room?
			_.map(socket.rooms, function(r){
				socket.leave(r);
			});
		});



		/////// Setting up a game stuff

		// Challenge a player to play a game
		// For now, these can also be done anywhere, but they should be limited to only working on players in the same room
		proc.register('challenge', function(data, callback){



			// Broadcast to other player


		})


		proc.register('request', function(data){ // Other player responds to request



			// Set up an initial game and have both
		});





		/////// Playing the game stuff


		proc.register('move', function(){


		});



	});


}
