'use strict';



/*
	User Object: {
		id: 'RandomSocketId',
		name: '',
		level: ''

		state: 0 for initial, 1 for waiting on request, 2 looking for random
	}


	Methods:
		Joining a room
		- join({room: 'roomName', name: 'userName', level: 'Jedi'}, function(err, data){ Data contains a list of users  });

		Leaving a room
		- leave({room: 'roomName'}, funciton(err){  })

		Challenging someone to a game
		- challenge({ player_id: 'id of other player' }) // TODO: Make sure this server-side times out and resets the player states in case something goes wrong

			-> Callback err is set in the case of a server error
				-> err is : { reason: 'timeout' } if the other user timed out
			-> If the challenge was successful, the data will be set
				-> data is : { ... insert state of initial game and which player is  ... } if the hame has started

		Accepting a challenge after receiving a 'challenged' event
		- accept({ player_id: 'id of person that challenged you' }) -> callback returns the same thing as challenge()



	Events/Notification
		When in a room, get a notification of the current list of players
		- userlist : called with array of users

		When someone requests to play you
		- challenged : called with { player: { .. id, name, level, ... } }


*/




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


	// Send a list of users to everyone in the room
	function broadcast_userlist(room){
		var list = userlist(io, room);
		io.to(room).emit('userlist', list);
		return list;
	}

	// Take the socket out of all rooms that it is in
	function leaveAll(socket){

		// TODO: There should only be one active room?
		_.map(socket.rooms, function(r){
			if(r != socket.id){ // The user is by default in a room with the same name as their id
				socket.leave(r);

				// Let everyone else in the room know that the socket left
				broadcast_userlist(r);
			}
		});
	}



	io.on('connection', function(socket){

		var proc = new RPC(socket, true);


		/////// Room managment stuff

		proc.register('join', function(data, callback){

			var room = data.room;

			// Leave all other rooms
			leaveAll(socket);

			// Store profile and join the current room
			socket.profile = {
				id: socket.id,
				name: data.name,
				level: data.level,

				state: { id: 0, name: 'initial' }
			};
			socket.join(room);

			// Broadcast user list to other players
			var list = broadcast_userlist(room);

			callback(null, list);
		});


		proc.register('leave', function(data, callback){
			leaveAll(socket);
			callback(null);
		});



		/////// Setting up a game stuff

		// Challenge a player to play a game
		// For now, these can also be done anywhere, but they should be limited to only working on players in the same room
		proc.register('challenge', function(data, callback){

			// Get the socket associated with the person being requested
			var other_id = data.player_id;
			var other = io.sockets.connected[other]

			if(socket.profile.state != 0 || other.profile.state != 0){
				callback('You or the other player is currently unavailable.');
				return;
			}


			// These two should be atomically be set
			socket.profile.state = { id: 1, name: 'challenging', challengee: other_id  };
			other.profile.state = { id: 2, name: 'challenged', challenger: socket.id };


			// Broadcast to other player
			io.to(other_id).emit('challenged', {
				player: {
					id: socket.profile.id,
					name: socket.profile.name,
					level: socket.profile.level
				}
			});

			var accepted = false;







			// Timeout the challenge after 20 seconds
			setTimeout(function(){

				if(!accepted){

					// TODO: Attomically reset both  users to their initial states


					callback({ reason: 'timeout' }, null);
				}


			}, 20 * 1000);



		})


		proc.register('accept', function(data, callback){ // Other player responds to request



			// Set up an initial game and have both
		});





		/////// Playing the game stuff


		proc.register('move', function(){


		});





		// Socket lifecycle
		socket.on('disconnect', function(){
			leaveAll(socket);

			// TODO: Also make sure this forgeits any games and declines all active requests
		});



	});


}
