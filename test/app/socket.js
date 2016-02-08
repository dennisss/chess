// Tests for all the server-side functions

var http = require('http'),
	Client = require(__src + '/client'),
	Server = require(__src + '/app'),
	Chess = require(__src + '/chess'),
	express = require('express');

describe('Socket', function(){

	var server, client, client2;

	// Start a server and make a client
	beforeEach(function(done){
		server = Server();
		server.listen(8000, function(){
			async.parallel([
				Client.make,
				Client.make
			], function(err, c){
				client = c[0];
				client2 = c[1];
				done(err);
			})
		});
	});

	afterEach(function(){
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
			})


		});

	})




	describe('in a room', function(){

		beforeEach(function *(){
			// Have both join a room
			yield client.call('join', {room: 'hello', name: 'bob', level: 'Noob'});
			yield client2.call('join', {room: 'hello', name: 'jeff', level: 'Noob'});
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

						})


					})

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
						})
					})
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

			game = yield client.call('challenge', { player_id: client2.socket.id });
		});


		it('black should start first', function(){
			assert.equal(game.turn, Chess.Type.Black);
		});

		it.skip('should be able to make a move', function(){

			// TODO: Determine which player's turn it is

		});



	})





});