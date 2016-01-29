var RPC = require('../src/rpc'),
	EventEmitter = require('events');

describe('RPC', function(){

	var sock;

	beforeEach(function(){
		sock = new EventEmitter();
	});


	it('can call a function', function(done){

		var server = new RPC(sock, true);
		server.register('add', function(params, callback){
			callback(null, params[0] + params[1]);
		})


		var client = new RPC(sock);
		client.call('add', [1, 2], function(err, res){
			assert.equal(err, null);
			assert.equal(res, 3);
			done();
		});

	});

	it('should fail for an unknown method', function(done){

		var server = new RPC(sock, true);
		server.register('add', null);


		var client = new RPC(sock);
		client.call('something_else', [], function(err, res){
			assert.notEqual(err, null);
			done();
		});

	})





});
