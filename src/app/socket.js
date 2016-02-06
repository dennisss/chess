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
				-> data is : { ... insert state of initial game and which player is which  ... } if the hame has started

		- random_challenge();


		Accepting a challenge after receiving a 'challenged' event
		- accept(); // { player_id: 'id of person that challenged you' }) -> callback returns the same thing as challenge()
		- reject();


		Moving a peice
		- move({ from: [0,0], to: [1,1] }) -> callback called with game state


	Events/Notification
		When in a room, get a notification of the current list of players
		- userlist : called with array of users

		When someone requests to play you
		- challenged : called with { player: { .. id, name, level, ... } }


*/




var RPC = require('../rpc'),
	Chess = require('../chess');


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

	// All games currently being played
	// Keys are player ids
	// Values are instances of Game
	var games = {};


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


		// Initial unready state
		socket.state = { id: -1, name: 'not ready' };


		/////// Room managment stuff

		proc.register('join', function(data, callback){

			var room = data.room;

			// Leave all other rooms
			leaveAll(socket);

			// Store profile and join the current room
			socket.profile = {
				id: socket.id,
				name: data.name,
				level: data.level
			};
			socket.state = { id: 0, name: 'initial' };
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

			if(!io.sockets.connected.hasOwnProperty(other_id)){
				callback('Can not find the user you want to challenge');
				return;
			}

			var other = io.sockets.connected[other_id]

			if(socket.state.id != 0 || other.state.id != 0){
				callback('You or the other player is currently unavailable.');
				return;
			}


			// These two should be atomically be set
			socket.state = { id: 1, name: 'challenging', challengee: other_id  };
			other.state = { id: 2, name: 'challenged', challenger: socket.id };


			// Broadcast to other player
			io.to(other_id).emit('challenged', {
				player: {
					id: socket.profile.id,
					name: socket.profile.name,
					level: socket.profile.level
				}
			});


			var accepted = false;

			socket.state.callmeback = function(){
				accepted = true;
				callback(null, games[socket.id]);
			}


			// Timeout the challenge after 20 seconds
			setTimeout(function(){
				if(!accepted){
					// TODO: Attomically reset both  users to their initial states
					socket.state = {id: 0, name: 'initial'};
					other.state = {id: 0, name: 'initial'};

					callback({ reason: 'timeout' }, null);
				}

			}, 20 * 1000);

		})


		proc.register('accept', function(data, callback){ // Other player responds to request


			if(socket.state.id != 2){
				callback('Cannot accept: You haven\'t been challenged by anyone');
				return;
			}


			// Set up an initial game and have both

			var other_id = socket.state.challenger;
			var other = io.sockets.connected[other_id];

			var game = new Chess.Game();
			game.players = [socket.profile, other.profile];

			// Store the game state
			games[socket.id] = game;
			games[other_id]  = game;

			// Let the challenger know that the game has started
			other.state.callmeback();

			// Set both player's states to ingame
			socket.state = { id: 4, name: 'ingame' };
			other.state = { id: 4, name: 'ingame' };


			callback(null, game);
		});





		/////// Playing the game stuff


		proc.register('move', function(data, callback){

			var game = games[socket.id];


			var from = data.from;
			var to = data.to;

			// game.board.grid


			// Emit to both players

		});

		proc.register('forfeit', function(data, callback){


		})





		// Socket lifecycle
		socket.on('disconnect', function(){
			leaveAll(socket);

			// TODO: Also make sure this forgeits any games and declines all active requests
		});



	});


};
