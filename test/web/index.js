var App = require(__src + '/app');

var ss = require('selenium-standalone');

var webdriverio = require('webdriverio');
var options = { desiredCapabilities: { browserName: 'firefox' } };


global.makeClient = function(done){
	var client = webdriverio.remote(options)
	client.init().then(function(err){
		done();
	});

	return client;
}

global.endClient = function(client, done){
	client.end().then(done);
}

describe('Web', function(){

	require('./router');

	describe('Pages', function(){

		// Spin up full server for automated testing
		var server, child;
		before(function(done){
			// TODO: Compile the latest bundle

			this.timeout(50000)

			server = App();
			server.listen(8000, function(){

				ss.start({
					spawnOptions: {
						stdio: 'ignore'
					}
				}, function(err, c){
					child = c;


					// Open a primary browser
					global.client = makeClient(done);
				});
			});
		})
		after(function(done){
			endClient(global.client, function(){
				child.kill();
				server.close();
				done();
			});
		});




		require('./home');
		require('./game');

	});


});
