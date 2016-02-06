// Tests for all the server-side functions

var http = require('http'),
	Client = require(__src + '/client'),
	Server = require(__src + '/app'),
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
		client.proc.call('join', {room: 'hello', name: 'player 1', level: ''}, function(err, data){
			assert.equal(err, null);
			assert.lengthOf(data, 1); // Should be one user


			// Then another user joins
			client2.proc.call('join', {room: 'hello', name: 'player 2', level: ''}, function(err, data){

				assert.equal(err, null);
				assert.lengthOf(data, 2);

				done();
			})


		});

	})


	it('can challenge someone and they should be able to accept', function(done){


		// Have both join a room
		async.map([client, client2], function(c, callback){
			c.proc.call('join', {room: 'hello', name: 'player ' + c.socket.id, level: ''}, function(err){
				callback(err);
			});
		}, function(err){

			if(err){
				done(err)
				return
			}


			async
			.parallel([

				function(callback){ // Player 2's actions
					client2.socket.on('challenged', function(data){

						client2.proc.call('accept', {}, function(err, game){

							assert.equal(err, null);
							assert.property(game, 'board');

							callback(err);

						})


					})

				},

				function(callback){ // Player 1's actions
					client.proc.call('challenge', {player_id: client2.socket.id}, function(err, game){

						assert.equal(err, null);
						assert.property(game, 'board');

						callback(err);
					});
				}

			], function(err){
				done(err);
			});




		});
	});



});
