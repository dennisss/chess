var RPC = require('../src/rpc'),
	EventEmitter = require('events');

describe('RPC', function(){

	var sock, server, client;

	beforeEach(function(){
		sock = new EventEmitter();

		server = new RPC(sock, true);
		server.register('add', function(params, callback){
			callback(null, params[0] + params[1]);
		});

		server.register('errgen', function(params, callback){
			callback('I\' an error');
		})

		client = new RPC(sock);
	});


	it('can call a function', function(done){

		client.call('add', [1, 2], function(err, res){
			assert.equal(err, null);
			assert.equal(res, 3);
			done();
		});

	});

	it('should fail for an unknown method', function(done){

		client.call('something_else', [], function(err, res){
			assert.notEqual(err, null);
			done();
		});

	})


	it('can call using promises', function*(){

		var promise = client.call('add', [1, 2]);

		assert(promise instanceof Promise);

		var sum = yield promise;
		assert.equal(sum, 3);

		var itErrored = false;
		try{
			yield client.call('errgen');
		}
		catch(e){
			itErrored = true;
		}


		assert(itErrored);
	})


});
