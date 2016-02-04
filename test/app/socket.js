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



});
