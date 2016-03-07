// Server-side chess listener

'use strict';

var SocketIO = require('socket.io'),
	_ = require('underscore'),
	User = require('./user'),
	RPC = require('./rpc'),
	Chess = require('./chess'),
	Move = Chess.Move,
	Position = Chess.Position,
	Color = Chess.Color;


// TODO: All state transitions away from InGame should cancel a game



/**
 * State of the user in the app
 *
 * @enum {number}
 */
var State = {
	/** Uninitialize/unavailable */
	None: -1,
	/** In a room, and ready for a game */
	Ready: 0,
	/** Challenging another player */
	Challenging: 1,
	/** Being challenged by another player */
	Challenged: 2,
	/** Searching for a random player in the same room */
	Searching: 3,
	/** Playing a game */
	InGame: 4
};



/**
 * List of users in the room. Emitted whenever a change to the list is detected.
 *
 * @event Server#userlist
 * @type {Array.<User>}
 */

/**
 * Someone has challenged the current user
 *
 * @event Server#challenged
 * @type {User}
 *
 */

/**
 * Move performed by the other player in the game.
 *
 * @event Server#moved
 * @type {Move}
 */

/**
 * The game has ended for some reason
 *
 * @event Server#endgame
 * @type {object}
 * @property {string} result either 'win', 'lose', or 'draw'
 */

/**
 * The other player has requested a draw
 *
 * @event Server#drawing
 */

/**
 * Starts a game
 *
 * @callback Server~gameCallback
 * @param err usually set if an unknown error occured or the other player timed out or refused a challenge
 * @param {Game|null} game
 */



/**
 * Manages communications for a single client looking to play chess
 *
 * @property {Object.<Game>} games current games being played (keys are the socket id of either player).
 * @property io underlying socket.io instance
 * @property {Object.<RPC>} clients
 *
 *
 * @fires Server#userlist
 * @fires Server#challenged
 * @fires Server#moved
 * @fires Server#endgame
 * @fires Server#drawing
 */
class Server {

	/**
	 * Create a server for listening to connections from a client
	 *
	 * @param baseServer the HTTPServer on which to listen for connections
	 */
	constructor(baseServer){

		this.nusers = 0;
		this.games = {};

		this.clients = {};

		var io = SocketIO(baseServer, {
			path: '/socket',
			serveClient: false
		});

		this.io = io;

		var self = this;

		// Route new connections through the serve
		io.on('connection', function(socket){

			self.nusers++;
			self._stats();

			// Because socket.io overwrites the room array before calling disconnect
			socket.real_rooms = socket.rooms;


			// Initial unready state
			socket.state = State.None;

			var proc = new RPC(socket, true);
			var exports = ['join', 'leave', 'challenge', 'accept', 'refuse', 'move', 'forfeit', 'draw', 'draw_respond', 'undo', 'undo_respond'];
			_.map(exports, function(func){
				proc.register(func, function(data, callback){
					self[func].call(self, socket, data, callback);
				});
			});

			socket.on('ready', function(){
				self._stats(socket);
			})

			socket.on('disconnect', function(){
				self.nusers--;
				self._stats();

				if(socket.state == State.Ready){
					self._leaveAll(socket);
				}
				if(socket.state == State.InGame){
					// Complete game
					self._finishgame(socket, 'lose', 'disconnect');
				}
				else if(socket.state == State.Challenged){
					// Auto-reject
					self.refuse(socket, {}, function(){});
				}

			});

		});


	}



	/**
	 * Join a room
	 *
	 * @param {User} data
	 * @param callback called with (err, data) where data has the initial list of users
	 */
	join(socket, data, callback){

		// Check the name hasn't been taken
		var taken = false;
		var users = this._userlist(data.room);
		for(var i = 0; i < users.length; i++){
			if(users[i].name === data.name){
				taken = true;
				break;
			}
		}

		if(taken){
			callback('user_taken');
			return;
		}


		// Store profile
		socket.profile = {
			id: socket.id,
			name: data.name,
			level: data.level
		};


		var room = data.room;

		// Join if not already in the room
		if(socket.real_rooms.indexOf(room) == -1){

			// Leave all other rooms
			this._leaveAll(socket);


			socket.state = State.Ready;

			// TODO: Handle the callback of .join() and .leave()
			socket.join(room);

		}

		// Broadcast user list to other players
		var list = this._broadcast_userlist(room);

		callback(null, list);


	}

	/**
	 * Leave the room you are in.
	 *
	 * @param {object} data should be of the form {room: 'roomName'}
	 */
	leave(socket, data, callback){
		this._leaveAll(socket);
		callback(null);
	}


	/**
	 * Challenge a user to play to game
	 * For now, these can also be done anywhere, but they should be limited to only working on players in the same room
	 *
	 * @param {object} data should be of the form { player_id: 'id of the other player or 'random' if looking for a random player ' }
	 * @param {Server~gameCallback} callback
	 */
	challenge(socket, data, callback){

		var self = this;

		// Get the socket associated with the person being requested
		var other_id = data.player_id;

		// TODO: Make sure that if one person is randomly waiting and the only person specifically challenges them, then the request goes through

		if(other_id == 'random'){ // Find someone in the room to challenge

			socket.state = State.Searching;

			var room = this._room(socket);
			if(!room){
				callback({text: 'Not in a room!'});
				return;
			}


			// Get a list of sockets in the room
			var clients = this.io.sockets.adapter.rooms[room];

			var list = _.map(_.keys(clients), function(id){ return self.io.sockets.connected[id]; });


			var other = null;

			for(var i = 0; i < list.length; i++){
				var c = list[i];
				if(c.id !== socket.id && c.state === State.Searching){
					other = c;
					break;
				}
			}

			if(other !== null){ // Can match immediately
				var game = this._startgame(socket, other);
				other.callmeback();
				callback(null, game);
			}
			else{ // Wait to be matched
				socket.callmeback = function(){
					callback(null, self.games[socket.id]);
				};
			}

			return;
		}


		var other = this.io.sockets.connected[other_id];

		if(other === undefined){
			callback({text: 'Can not find the user you want to challenge'});
			return;
		}



		if(socket.state != State.Ready || other.state != State.Ready){
			callback({text: 'You or the other player is currently unavailable.'});
			return;
		}


		// These two should be atomically be set
		socket.state = State.Challenging; socket.challengee = other_id;
		other.state = State.Challenged; other.challenger = socket.id;


		// Broadcast to other player
		this.io.to(other_id).emit('challenged', {
			player: socket.profile
		});


		// Timeout the challenge after 20 seconds
		var time = setTimeout(function(){
			// TODO: Attomically reset both  users to their initial states
			socket.state = State.Ready;
			other.state = State.Ready;

			callback({ reason: 'timeout' }, null);

		}, 20 * 1000);

		socket.callmeback = function(answer){
			clearTimeout(time);

			if(answer){ // Accepted
				callback(null, self.games[socket.id]);
			}
			else{ // Refused
				callback({ reason: 'refused' }, null);
			}
		};

	}

	/**
	 * Accepting a challenge after receiving a 'challenged' event
	 *
	 * @param socket
	 * @param data
	 * @param {Server~gameCallback} callback
	 */
	accept(socket, data, callback){
		if(socket.state != State.Challenged){
			callback('Cannot accept: You haven\'t been challenged by anyone');
			return;
		}


		// Set up an initial game

		var other_id = socket.challenger;
		var other = this.io.sockets.connected[other_id];


		var game = this._startgame(socket, other);


		// Let the challenger know that the game has started
		other.callmeback(true);

		// Let the challengee know
		callback(null, game);
	}

	/**
	 * Start a game between two sockets
	 *
	 * @private
	 */
	_startgame(socket, other){

		var game = new Chess.Game(socket.profile, other.profile);

		// Store the game state
		this.games[socket.id] = game;
		this.games[other.id]  = game;

		// Set both player's states to ingame
		socket.state = State.InGame;
		other.state = State.InGame;

		this._stats();

		return game;
	}


	/**
	 * Refuse a challenge
	 */
	refuse(socket, data, callback){
		if(socket.state != State.Challenged){
			callback('Cannot refuse: You haven\'t been challenged by anyone');
			return;
		}

		var other_id = socket.challenger;
		var other = this.io.sockets.connected[other_id];

		socket.state = State.Ready;
		other.state = State.Ready;

		other.callmeback(false);

		callback(null);
	}


	/**
	 * Make a move in a game
	 *
	 * @param {Move} data the serialized move that should be applied
	 * @param callback called when the move is processed. the err field should be checked to determine if the move was invalid
	 */
	move(socket, data, callback){
		if(socket.state != State.InGame){
			callback('Cannot move: You are not in a game');
			return;
		}

		var game = this.games[socket.id];
		var move = new Move(data);

		// Validate color : make sure the
		var color = game.white_player.id == socket.id? Color.White : Color.Black;
		if(move.color !== color){

			//if(socket.id != game.white_player.id && socket.id != game.black_player.id){
			//	callback('Not in the game?');
			//	return;
			//}

			callback('Cannot move as the other player');
			return;
		}

		var other_id = color === Color.White? game.black_player.id : game.white_player.id;


		var err = game.board.apply(move);

		if(err){
			callback(err);
			return;
		}

		this.io.to(other_id).emit('moved', move);
		callback(null);


		// Check if game is in checkmate, if so, end the game
		if(game.board.isEndGame()){
			this._finishgame(socket, 'win', 'checkmate');
		}
	}


	/**
	 * When in a game, quit it
	 */
	forfeit(socket, data, callback){

		if(socket.state !== State.InGame){
			callback('Can only forfeit will playing a game');
			return;
		}

		this._finishgame(socket, 'lose', 'forfeit');

		callback(null);
	}

	/**
	 * Request to draw the game
	 *
	 * @param data should be null
	 * @param callback called with (err, accepted) where accepted is a bool indicating if the draw was accepted
	 */
	draw(socket, data, callback){
		if(socket.state !== State.InGame){
			callback('Can only draw will playing a game');
			return;
		}


		var game = this.games[socket.id];
		var other_id = (game.white_player.id == socket.id)? game.black_player.id : game.white_player.id;
		var other = this.io.sockets.connected[other_id];

		// TODO: Check that the other person isn't already drawing


		game.drawing = socket.id;


		this.io.to(other_id).emit('drawing');

		socket.callmeback = function(accepted){
			callback(null, accepted);
		};

	}

	/**
	 * Respond to a drawing notification
	 *
	 * @param {boolean} data if accepted, otherwise false
	 */
	draw_respond(socket, data, callback){
		if(socket.state !== State.InGame){
			callback('Must be in a game');
			return;
		}

		var game = this.games[socket.id];
		var other_id = (game.white_player.id == socket.id)? game.black_player.id : game.white_player.id;
		var other = this.io.sockets.connected[other_id];

		if(!game.drawing || game.drawing !== other_id){
			callback('The other person isn\'t drawing');
			return;
		}

		delete game.drawing;

		other.callmeback(data);
		if(data.answer){
			this._finishgame(socket, 'draw');
		}
	}

	/**
	 * Request to undo a move
	 *
	 */
	undo(socket, data, callback){
		// TODO: Only allow if the current user just went

		// TODO: Ask the other user for permission
	}

	/**
	 * Respond to a request to undo a move
	 *
	 * @param socket
	 * @param {boolean} data whether or not you accept the undo
	 */
	undo_respond(socket, data, callback){


	}




	/**
	 * Finalize a game
	 *
	 * @param socket
	 * @param {string} result 'win', 'lose', or 'draw' with respect to the current player)
	 * @param {string} reason
	 * @private
	 */
	_finishgame(socket, result, reason){

		var game = this.games[socket.id];


		var other_id = (game.white_player.id == socket.id)? game.black_player.id : game.white_player.id;
		var other = this.io.sockets.connected[other_id];

		delete this.games[game.white_player.id];
		delete this.games[game.black_player.id];

		socket.state = State.None;
		other.state = State.None;

		var other_result;

		// Tell the other player the opposite result
		if(result == 'win')
			other_result = 'lose';
		else if(result == 'lose')
			other_result = 'win';
		else if(result == 'draw')
			other_result = 'draw';
		else
			throw 'Invalid result for game';

		// Send to both players
		this.io.to(socket.id).emit('endgame', {result: result, reason: reason});
		this.io.to(other.id).emit('endgame', {result: other_result, reason: reason});

		this._stats();
	}



	/**
	 * Get the room name of the player
	 *
	 * @private
	 * @return {string|null}
	 */
	_room(socket){
		for(var i = 0; i < socket.real_rooms.length; i++){
			if(socket.real_rooms[i] !== socket.id)
				return socket.real_rooms[i];
		}

		return null;
	}

	/**
	 * Get users in a room
	 *
	 * @private
	 */
	_userlist(room){
		var clients = this.io.sockets.adapter.rooms[room];

		var self = this;
		return _.map(_.keys(clients), function(id){
			var c = self.io.sockets.connected[id];
			return c.profile;
		});
	}

	/**
	 * Send a list of users to everyone in the room
	 *
	 * @private
	 */
	_broadcast_userlist(room){
		var list = this._userlist(room);
		this.io.to(room).emit('userlist', list);
		return list;
	}

	/**
	 * Take the socket out of all rooms that it is in
	 *
	 * @private
	 */
	_leaveAll(socket){

		var self = this;

		// TODO: There should only be one active room?
		_.map(socket.real_rooms, function(r){
			if(r != socket.id){ // The user is by default in a room with the same name as their id
				socket.leave(r);

				// Let everyone else in the room know that the socket left
				self._broadcast_userlist(r);
			}
		});
	}

	_stats(socket){
		var ngames = _.keys(this.games).length / 2;
		var nusers = this.nusers || 0;
		var data = {users: nusers, games: ngames};
		if(socket)
			socket.emit('stats', data);
		else
			this.io.emit('stats', data);
	}



}

module.exports = Server;
