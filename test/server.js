// Tests for all the server-side functions

var http = require('http'),
	Client = require(__src + '/client'),
	App = require(__src + '/app'),
	Chess = require(__src + '/chess'),
	express = require('express'),
	Position = require(__src +'/position');

describe('Server', function(){

	var server, client, client2;

	// Start a server and make a client
	beforeEach(function(done){
		server = App();
		server.listen(8000, function(){
			async.parallel([
				Client.make,
				Client.make
			], function(err, c){
				client = c[0];
				client2 = c[1];
				done(err);
			});
		});
	});

	afterEach(function(){
		client.socket.close();
		client2.socket.close();
		server.close();
	});

	it('should be able to join a room', function(done){

		// Have one user join
		client.call('join', {room: 'hello', name: 'player 1', level: ''}, function(err, data){
			assert.equal(err, null);
			assert.lengthOf(data, 1); // Should be one user


			// Then another user joins
			client2.call('join', {room: 'hello', name: 'player 2', level: ''}, function(err, data){

				assert.equal(err, null);
				assert.lengthOf(data, 2);

				done();
			});
		});
	});

	it('should be able to leave a room', function(done) {

		// Have one user join
		client.call('join', {room: 'vROOM', name: 'TruckDriver', level: ''}, function(err, data){
			assert.equal(err, null);
			assert.lengthOf(data, 1); // Should be one user


			// Have the user leave
			client.call('leave', {room: 'vROOM'}, function(err){
				assert.equal(err, null);
				done(err);
			});

			// TODO: assert there are no more users in this room now.
			// TODO: add alternative tests when there are other users in the room.
		});
	});

	describe('in a room', function(){

		beforeEach(function *(){
			// Have both join a room
			yield client.call('join', {room: 'hello', name: 'bob', level: 'Noob'});
			yield client2.call('join', {room: 'hello', name: 'medusa', level: 'Noob'});
		});

		it('can challenge someone and they should be able to accept', function(done){

			async
			.parallel([

				function(callback){ // Player 2's actions
					client2.socket.on('challenged', function(data){

						assert.equal(data.player.id, client.socket.id);

						client2.call('accept', {}, function(err, game){

							assert.equal(err, null);
							assert.property(game, 'board');
							assert.property(game, 'white_player');
							assert.property(game, 'black_player');

							callback(err);

						});


					});

				},

				function(callback){ // Player 1's actions
					client.call('challenge', {player_id: client2.socket.id}, function(err, game){

						assert.equal(err, null);
						assert.property(game, 'board');
						assert.property(game, 'white_player');
						assert.property(game, 'black_player');

						callback(err);
					});
				}

			], function(err){
				done(err);
			});

		});

		it('should be able to refuse a challenge', function(done){

			async
			.parallel([
				function(callback){ // Player 2's actions
					client2.socket.on('challenged', function(data){
						client2.call('refuse', {}, function(err){
							assert.equal(err, null);
							callback(err);
						});
					});
				},

				function(callback){ // Player 1's actions
					client.call('challenge', {player_id: client2.socket.id}, function(err){
						assert(err);
						callback(null);
					});
				}

			], function(err){
				done(err);
			});

		});

		it('should be able to be randomly matched', function(done){

			async
			.parallel([
				function(callback){
					client.call('challenge', {player_id: 'random'}, function(err, game){
						assert.property(game, 'board');
						callback(err);
					});
				},
				function(callback){
					client2.call('challenge', {player_id: 'random'}, function(err, game){
						assert.property(game, 'board');
						callback(err);
					});
				}

			], function(err){
				assert(!err);
				done();
			});



			// Start by putting two users in a room and have them both random_chellenge, see if they get matched

			// TODO: scale to multiple users in a room as well (probably new test cases)
		});

	});

	describe('in a game', function(){

		var game;

		beforeEach(function *(){
			// Have both join a room
			yield client.call('join', {room: 'hello', name: 'bob', level: 'Noob'});
			yield client2.call('join', {room: 'hello', name: 'jeff', level: 'Noob'});

			client2.socket.on('challenged', function(data){
				client2.call('accept');
			});

			game = new Chess.Game(yield client.call('challenge', { player_id: client2.socket.id }));
		});


		it('white player should start first', function(){
			assert.equal(game.board.turn, Chess.Color.White);
		});

		it('challengee should move first', function(){
			assert.equal(game.white_player.id, client2.socket.id);
		})

		it('should be able to make a move', function(done){

			client2.call('move',{ from: [1,6], to: [1,5], color: Chess.Color.White }, function(err){
				assert.equal(err, null);
				done(err); // TODO: does this have to do with the errors the tests have been throwing?
			});

			// Verification for legal moves are in chess.js
		});

		it('can forfeit while in a game', function(done){

			async
			.parallel([
				function(done){
					client.socket.on('endgame', function(data){
						assert.equal(data.reason, 'forfeit');
						assert.equal(data.result, 'win');
						done();
					});
				},
				function(done){

					client2.socket.on('endgame', function(data){
						assert.equal(data.reason, 'forfeit');
						assert.equal(data.result, 'lose');
						done();
					})

					client2.call('forfeit'); // TODO: Also validate the response of this call
				}
			], function(err){
				done(err);
			});

		});


		it('can agree to a draw', function(done){

			// Listen for endgame
			async
			.parallel([
				function(done){
					client.socket.on('endgame', function(data){
						assert.equal(data.result, 'draw');
						done();
					});
				},
				function(done){
					client2.socket.on('endgame', function(data){
						assert.equal(data.result, 'draw');
						done();
					})
				}
			], function(err){
				done(err);
			});



			client2.socket.on('drawing', function(){
				client2.call('draw_respond', true);
			})

			// Do the drawing
			client.call('draw');

		})

	});

});
